import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1">
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <Container>
          <div className="flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="text-primary">Orca</span> Whirlpool Dashboard
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Manage your concentrated liquidity positions, explore pools, and optimize your yields
              on Orca&apos;s Whirlpool protocol.
            </p>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  View Dashboard
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/explore">
                  Explore Pools
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section id="features" className="container space-y-6 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Features
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Everything you need to manage your Whirlpool liquidity positions
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>LP Dashboard</CardTitle>
              <CardDescription>
                View all your active liquidity positions in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              Track your positions, monitor fees, and check if you&apos;re in range
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pool Explorer</CardTitle>
              <CardDescription>
                Discover and analyze all active Whirlpools
              </CardDescription>
            </CardHeader>
            <CardContent>
              Filter by TVL, APR, and fee tiers to find the best opportunities
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Rebalance Simulator</CardTitle>
              <CardDescription>
                Optimize your positions with our rebalancing tool
              </CardDescription>
            </CardHeader>
            <CardContent>
              Simulate different price ranges and compare projected yields
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
