'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { historicalData } from "@/lib/placeholder-data";

const chartData = historicalData.map(d => ({...d, date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})).reverse();

const chartConfig = {
  temp: {
    label: "Temperature",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function HistoricalData() {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Historical Data</CardTitle>
        <CardDescription>Past 7 days weather data.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Temperature Trend (°C)</h3>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value}°`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <defs>
                <linearGradient id="fillTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-temp)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-temp)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                dataKey="temp"
                type="natural"
                fill="url(#fillTemp)"
                stroke="var(--color-temp)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Weather Log</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Temp (°C)</TableHead>
                  <TableHead className="text-right">Humidity (%)</TableHead>
                  <TableHead className="text-right">Rain (mm)</TableHead>
                  <TableHead className="text-right">Wind (km/h)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historicalData.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</TableCell>
                    <TableCell className="text-right">{data.temp}</TableCell>
                    <TableCell className="text-right">{data.humidity}</TableCell>
                    <TableCell className="text-right">{data.rain}</TableCell>
                    <TableCell className="text-right">{data.wind}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
