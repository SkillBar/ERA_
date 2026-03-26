import { useMemo } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type ScalePoint = {
  month: number
  label: string
  points: number
  profitMln: number
}

const KIDS_SCALE_24M: ScalePoint[] = [
  { month: 1, label: "М1", points: 1, profitMln: -0.3 },
  { month: 2, label: "М2", points: 1, profitMln: -0.2 },
  { month: 3, label: "М3", points: 2, profitMln: -0.1 },
  { month: 4, label: "М4", points: 3, profitMln: 0.2 },
  { month: 5, label: "М5", points: 5, profitMln: 0.6 },
  { month: 6, label: "М6", points: 7, profitMln: 1.1 },
  { month: 7, label: "М7", points: 10, profitMln: 1.8 },
  { month: 8, label: "М8", points: 14, profitMln: 2.8 },
  { month: 9, label: "М9", points: 18, profitMln: 3.9 },
  { month: 10, label: "М10", points: 23, profitMln: 5.3 },
  { month: 11, label: "М11", points: 29, profitMln: 6.8 },
  { month: 12, label: "М12", points: 36, profitMln: 8.6 },
  { month: 13, label: "М13", points: 44, profitMln: 10.9 },
  { month: 14, label: "М14", points: 52, profitMln: 13.3 },
  { month: 15, label: "М15", points: 60, profitMln: 16.0 },
  { month: 16, label: "М16", points: 67, profitMln: 18.4 },
  { month: 17, label: "М17", points: 73, profitMln: 20.6 },
  { month: 18, label: "М18", points: 78, profitMln: 22.3 },
  { month: 19, label: "М19", points: 83, profitMln: 24.8 },
  { month: 20, label: "М20", points: 88, profitMln: 27.3 },
  { month: 21, label: "М21", points: 92, profitMln: 30.0 },
  { month: 22, label: "М22", points: 95, profitMln: 32.4 },
  { month: 23, label: "М23", points: 98, profitMln: 34.9 },
  { month: 24, label: "М24", points: 100, profitMln: 36.4 },
]

function formatProfit(valueMln: number): string {
  return `${new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(valueMln)} млн ₽`
}

export function KidsScaleChart() {
  const chartData = useMemo(() => KIDS_SCALE_24M, [])

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-col gap-4 pb-0 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <CardTitle>Рост сети Kids и прибыль</CardTitle>
          <CardDescription>
            Нелинейное масштабирование до 100 точек за 24 месяца.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <defs>
                <linearGradient id="kidsPoints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="kidsProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                minTickGap={16}
                className="fill-muted-foreground text-xs"
              />
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                width={42}
                className="fill-muted-foreground text-xs"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                width={58}
                className="fill-muted-foreground text-xs"
                tickFormatter={(v) => `${v}м`}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 10,
                }}
                formatter={(value, name) => {
                  const numericValue = Number(value ?? 0)
                  if (name === "profitMln") return [formatProfit(numericValue), "Прибыль"]
                  return [`${numericValue} точек`, "Развитие сети"]
                }}
                labelFormatter={(_, payload) => {
                  const point = payload?.[0]?.payload as ScalePoint | undefined
                  return point ? `${point.month} месяц` : ""
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="points"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#kidsPoints)"
                name="points"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="profitMln"
                stroke="#14b8a6"
                strokeWidth={2}
                fill="url(#kidsProfit)"
                name="profitMln"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
