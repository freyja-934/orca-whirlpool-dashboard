"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SimpleToastContainer } from "@/components/ui/simple-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/useToast";
import { useWallet } from "@/hooks/useWallet";
import AddWidgetControls from '@/widgets/AddWidgetControls';
import LayoutControls from '@/widgets/LayoutControls';
import WidgetContainer from '@/widgets/WidgetContainer';
import { Grid, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DashboardPage() {
  const { isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toasts, showToast, removeToast } = useToast();
  
  const handleWidgetAdded = (widgetName: string) => {
    showToast(`${widgetName} added!`, 'Widget added to your dashboard');
    setActiveTab('dashboard');
  };

  if (!isConnected) {
    return (
      <Container className="py-8">
        <div className="text-center space-y-4 max-w-md mx-auto">
          <h1 className="text-3xl font-bold">Connect Your Wallet</h1>
          <p className="text-muted-foreground">
            Please connect your wallet to view your Whirlpool positions and manage your liquidity.
          </p>
          <div className="pt-4">
            <Button asChild>
              <Link href="/">Go to Home</Link>
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Customize your workspace with draggable widgets
            </p>
          </div>
          <LayoutControls />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard" className="gap-2">
              <Grid className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="widgets" className="gap-2">
              <Settings className="h-4 w-4" />
              Add Widgets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="relative min-h-[700px] bg-gradient-to-br from-muted/20 to-muted/5 rounded-xl border border-border/50 p-4 overflow-hidden">
              <WidgetContainer />
              <div className="absolute inset-0 bg-grid-small-black/[0.02] dark:bg-grid-small-white/[0.02] pointer-events-none" />
            </div>
          </TabsContent>

          <TabsContent value="widgets" className="space-y-4">
            <div className="bg-muted/5 rounded-xl border border-border/50 p-6">
              <h2 className="text-lg font-semibold mb-4">Available Widgets</h2>
              <AddWidgetControls onWidgetAdded={handleWidgetAdded} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <SimpleToastContainer toasts={toasts} removeToast={removeToast} />
    </Container>
  );
} 