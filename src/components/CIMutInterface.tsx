/// <reference types="vite/client" />
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CodeBlock } from "@/components/ui/code-block";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Terminal, Zap, Eye, FileText, HelpCircle, MessageSquare, Send, Bot } from "lucide-react";

interface VerifyData {
  file_path: string;
  line_content: string;
  line_number: number;
  total_lines: number;
}

interface VerifyResponse {
  success: boolean;
  data?: VerifyData;
  error?: string;
}

interface MutateResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface FaultTargetResponse {
  target_file: string;
  target_function: string;
  mutation_suggestion: {
    modifications: Array<{
      line_number: number;
      new_content: string;
      reason: string;
    }>;
  };
  mutation_info: {
    file_path: string;
    line_number: number;
    old_content: string;
    new_content: string;
    backup_path: string;
    timestamp: string;
  };
  llm_analysis: string;
}

interface ChatMessage {
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function CIMutInterface() {
  const [agentId, setAgentId] = useState("");
  const [filePath, setFilePath] = useState("");
  const [lineNumber, setLineNumber] = useState("");
  const [newContent, setNewContent] = useState("");
  const [verifiedContent, setVerifiedContent] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [mutateStatus, setMutateStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const [chatQuery, setChatQuery] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"manual" | "chat">("chat");

  const { toast } = useToast();

  const handleVerify = async () => {
    if (!agentId || !filePath || !lineNumber) {
      toast({
        title: "Missing Fields",
        description: "Please fill in Agent ID, File Path, and Line Number",
        variant: "destructive",
      });
      return;
    }

    setVerifyStatus("loading");
    setVerifiedContent("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/${agentId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_path: filePath,
          line_number: parseInt(lineNumber),
        }),
      });

      const verifyResult: VerifyResponse = await response.json();


      if (verifyResult.success && verifyResult.data) {
        setVerifiedContent(verifyResult.data.line_content);
        setVerifyStatus("success");
        toast({
          title: "Line Verified",
          description: "Successfully retrieved line content",
        });
      } else {
        setVerifyStatus("error");
        toast({
          title: "Verification Failed",
          description: verifyResult.error || "Failed to verify line content",
          variant: "destructive",
        });
      }
    } catch (error) {
      setVerifyStatus("error");
      toast({
        title: "Network Error",
        description: "Failed to connect to CIMut API",
        variant: "destructive",
      });
    }
  };

  const handleMutate = async () => {
    if (!agentId || !filePath || !lineNumber || !newContent) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all fields including New Content",
        variant: "destructive",
      });
      return;
    }

    setMutateStatus("loading");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/${agentId}/fault`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_path: filePath,
          line_number: parseInt(lineNumber),
          new_content: newContent,
        }),
      });

      const mutateResult: MutateResponse = await response.json();

      if (mutateResult.success) {
        setMutateStatus("success");
        toast({
          title: "Mutation Applied",
          description: mutateResult.message || "Successfully applied code mutation",
        });
      } else {
        setMutateStatus("error");
        toast({
          title: "Mutation Failed",
          description: mutateResult.error || "Failed to apply code mutation",
          variant: "destructive",
        });
      }
    } catch (error) {
      setMutateStatus("error");
      toast({
        title: "Network Error",
        description: "Failed to connect to CIMut API",
        variant: "destructive",
      });
    }
  };

  const handleChatQuery = async () => {
    if (!agentId || !chatQuery.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please fill in Agent ID and enter a query",
        variant: "destructive",
      });
      return;
    }

    setChatLoading(true);

    const userMessage: ChatMessage = {
      type: "user",
      content: chatQuery,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatQuery("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/${agentId}/find-fault-target`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: chatQuery,
        }),
      });

      const data: FaultTargetResponse = await response.json();

      if (data.target_file && data.mutation_suggestion) {
        const assistantMessage: ChatMessage = {
          type: "assistant",
          content: `**Target File:** ${data.target_file}
**Function:** ${data.target_function}

**Suggested Mutation:**
- Line ${data.mutation_suggestion.modifications[0]?.line_number}
- Reason: ${data.mutation_suggestion.modifications[0]?.reason}

**Original Content:**
\`${data.mutation_info.old_content}\`

**New Content:**
\`${data.mutation_info.new_content}\`

**Backup created at:** ${data.mutation_info.backup_path}`,
          timestamp: new Date(),
        };
        
        setChatMessages(prev => [...prev, assistantMessage]);
        
        // Auto-fill manual form with the suggestion
        setFilePath(data.mutation_info.file_path);
        setLineNumber(data.mutation_info.line_number.toString());
        setNewContent(data.mutation_info.new_content);
        
        toast({
          title: "Fault Found",
          description: "Mutation suggestion generated successfully",
        });
      } else {
        const errorMessage: ChatMessage = {
          type: "assistant",
          content: "Unable to find a suitable fault for your query. Try rephrasing your question.",
          timestamp: new Date(),
        };
        setChatMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        type: "assistant",
        content: "Error connecting to the API. Please try again.",
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Network Error",
        description: "Failed to connect to CIMut API",
        variant: "destructive",
      });
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-bg">
      <div className="container mx-auto max-w-6xl space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Terminal className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              CIMut
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Cloud Injection Mutator - Advanced Code Mutation Testing
          </p>
          <div className="flex justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <HelpCircle className="h-4 w-4" />
                  How to Use
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-accent" />
                    How to Use CIMut
                  </DialogTitle>
                  <DialogDescription>
                    Follow these steps to configure and use the system
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-semibold">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">Run Script on Cloud</h4>
                        <p className="text-sm text-muted-foreground">
                          Download and execute the <a 
                            href="https://github.com/AgiuG/cimut-agent" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 underline font-medium"
                          >
                            cimut-agent script
                          </a> in your cloud environment to establish API communication
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-semibold">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">Get Agent ID</h4>
                        <p className="text-sm text-muted-foreground">
                          After running the script, you will receive a unique Agent ID for your instance
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-semibold">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">Configure Parameters</h4>
                        <p className="text-sm text-muted-foreground">
                          Enter the Agent ID, file path, and line number in the fields below
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-semibold">
                        4
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">Verify and Mutate</h4>
                        <p className="text-sm text-muted-foreground">
                          Use "Verify Line" to view current content, then apply the mutation
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="shadow-card border-border/50 max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="globalAgentId" className="text-foreground">Agent ID *</Label>
              <Input
                id="globalAgentId"
                placeholder="Enter agent identifier"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="font-mono"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "manual" | "chat")}>
            <CardHeader>
              <TabsList className="w-full">
                <TabsTrigger value="chat" className="flex-1 gap-2">
                  <Bot className="h-4 w-4" />
                  AI Chat
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex-1 gap-2">
                  <Terminal className="h-4 w-4" />
                  Manual Mode
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="chat" className="space-y-6">
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">AI Fault Injection</h3>
                    <p className="text-sm text-muted-foreground">
                      Describe what kind of error you want to cause and the AI will find the ideal location
                    </p>
                  </div>
                  
                  {/* Chat Messages */}
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                    <div className="space-y-4">
                      {chatMessages.length === 0 ? (
                        <div className="text-center text-muted-foreground">
                          <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Start by describing what kind of fault you want to inject</p>
                          <p className="text-xs mt-1">Example: "I want to cause an error in VM creation"</p>
                        </div>
                      ) : (
                        chatMessages.map((message, index) => (
                          <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] p-3 rounded-lg ${
                              message.type === "user" 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-muted"
                            }`}>
                              <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                              <div className="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-muted p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                              <span className="text-sm">Processing...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  
                  {/* Chat Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Example: I want to cause an error in VM creation"
                      value={chatQuery}
                      onChange={(e) => setChatQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && !chatLoading && handleChatQuery()}
                      disabled={chatLoading || !agentId}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleChatQuery}
                      disabled={chatLoading || !agentId || !chatQuery.trim()}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {!agentId && (
                    <p className="text-xs text-destructive text-center">
                      Configure the Agent ID above to use the chat
                    </p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="manual" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Manual Configuration */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">Configuration</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="filePath" className="text-foreground">File Path *</Label>
                          <Input
                            id="filePath"
                            placeholder="/opt/stack/nova/nova/objects/block_device.py"
                            value={filePath}
                            onChange={(e) => setFilePath(e.target.value)}
                            className="font-mono text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lineNumber" className="text-foreground">Line Number *</Label>
                          <Input
                            id="lineNumber"
                            type="number"
                            placeholder="90"
                            value={lineNumber}
                            onChange={(e) => setLineNumber(e.target.value)}
                            className="font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <Button
                          onClick={handleVerify}
                          disabled={verifyStatus === "loading"}
                          variant="cyber"
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4" />
                          Verify Line
                        </Button>
                      </div>

                      <StatusIndicator
                        status={verifyStatus}
                        message={
                          verifyStatus === "loading" ? "Verifying line content..." :
                          verifyStatus === "success" ? "Line content verified successfully" :
                          verifyStatus === "error" ? "Failed to verify line content" : undefined
                        }
                      />
                    </div>
                  </div>

                  {/* Code Display */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Current Line Content</h3>
                    <CodeBlock
                      content={verifiedContent}
                      title={filePath ? `${filePath}:${lineNumber}` : "No file selected"}
                      className="min-h-[200px]"
                    />
                  </div>
                </div>

                {/* Mutation Section */}
                <div className="space-y-6 border-t pt-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Zap className="h-5 w-5 text-accent" />
                    Code Mutation
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newContent" className="text-foreground">New Content *</Label>
                    <Textarea
                      id="newContent"
                      placeholder="        'volume_size': fields.IntegerField(nullable=True),"
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="font-mono text-sm min-h-[100px] resize-none"
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the new content that will replace the current line
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleMutate}
                      disabled={mutateStatus === "loading" || !verifiedContent}
                      variant="default"
                      className="flex-1"
                    >
                      <Zap className="h-4 w-4" />
                      Apply Mutation
                    </Button>
                  </div>

                  <StatusIndicator
                    status={mutateStatus}
                    message={
                      mutateStatus === "loading" ? "Applying code mutation..." :
                      mutateStatus === "success" ? "Code mutation applied successfully" :
                      mutateStatus === "error" ? "Failed to apply code mutation" : undefined
                    }
                  />
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}