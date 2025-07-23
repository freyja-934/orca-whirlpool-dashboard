import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Activity, BarChart, DollarSign, Wallet } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <Container className="py-8 sm:py-12 lg:py-16">
      {/* Force Tailwind to generate bg-primary */}
      <div className="hidden bg-primary bg-primary/90"></div>
      
      <div className="mx-auto max-w-4xl space-y-8 sm:space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Orca Whirlpool Dashboard
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Manage your liquidity positions, explore pools, and optimize your DeFi strategy on Solana&apos;s premier AMM
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 px-4">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/dashboard">
                <Wallet className="mr-2 h-5 w-5" />
                View Dashboard
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/explore">
                <BarChart className="mr-2 h-5 w-5" />
                Explore Pools
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 px-4 sm:px-0">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
                Liquidity Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm sm:text-base">
                Track your LP positions, monitor performance, and collect fees all in one place
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
                Real-time Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm sm:text-base">
                View live pool metrics, TVL, volume, and APR to make informed decisions
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <BarChart className="h-5 w-5 sm:h-6 sm:w-6" />
                Pool Explorer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm sm:text-base">
                Discover new opportunities across hundreds of Whirlpool liquidity pools
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/20 mx-4 sm:mx-0">
          <CardHeader className="text-center">
            <CardTitle className="text-xl sm:text-2xl">Ready to dive in?</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Connect your wallet to start managing your Whirlpool positions
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
