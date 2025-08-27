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
import { useToast } from "@/hooks/use-toast";
import { Terminal, Zap, Eye, FileText, HelpCircle } from "lucide-react";

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

export function CIMutInterface() {
  const [agentId, setAgentId] = useState("");
  const [filePath, setFilePath] = useState("");
  const [lineNumber, setLineNumber] = useState("");
  const [newContent, setNewContent] = useState("");
  const [verifiedContent, setVerifiedContent] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [mutateStatus, setMutateStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
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

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Configuration
              </CardTitle>
              <CardDescription>
                Set up your mutation testing parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agentId" className="text-foreground">Agent ID *</Label>
                  <Input
                    id="agentId"
                    placeholder="Enter agent identifier"
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    className="font-mono"
                  />
                </div>

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

              <div className="flex gap-3">
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
            </CardContent>
          </Card>

          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary" />
                Current Line Content
              </CardTitle>
              <CardDescription>
                Verified content from the specified line
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock
                content={verifiedContent}
                title={filePath ? `${filePath}:${lineNumber}` : "No file selected"}
                className="min-h-[200px]"
              />
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              Code Mutation
            </CardTitle>
            <CardDescription>
              Apply fault injection by modifying the line content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
