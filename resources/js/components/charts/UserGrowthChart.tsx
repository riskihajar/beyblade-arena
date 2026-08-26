import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import {
    Frame,
    FrameDescription,
    FrameFooter,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/ui/frame';
import type { UserGrowthData } from '@/types';
import { TrendingUp } from 'lucide-react';
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from 'recharts';

interface UserGrowthChartProps {
    data: UserGrowthData[];
}

const chartConfig = {
    users: {
        label: 'Users',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig;

export default function UserGrowthChart({ data }: UserGrowthChartProps) {
    const chartData = data.map((item) => ({
        date: new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        }),
        users: item.count,
    }));

    return (
        <Frame>
            <FrameHeader>
                <FrameTitle>User Growth</FrameTitle>
                <FrameDescription>
                    {chartData[0]?.date} -{' '}
                    {chartData[chartData.length - 1]?.date}
                </FrameDescription>
            </FrameHeader>
            <FramePanel>
                <div className="flex-1 px-5">
                    <ChartContainer config={chartConfig}>
                        <LineChart
                            accessibilityLayer
                            data={chartData}
                            margin={{
                                top: 20,
                                left: 12,
                                right: 12,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        indicator="line"
                                        hideLabel
                                    />
                                }
                            />
                            <Line
                                dataKey="users"
                                type="natural"
                                stroke="var(--color-users)"
                                strokeWidth={2}
                                dot={{
                                    fill: 'var(--color-users)',
                                }}
                                activeDot={{
                                    r: 6,
                                }}
                            >
                                <LabelList
                                    position="top"
                                    offset={12}
                                    className="fill-foreground"
                                    fontSize={12}
                                />
                            </Line>
                        </LineChart>
                    </ChartContainer>
                </div>
            </FramePanel>
            <FrameFooter>
                <div className="flex gap-2 leading-none font-medium">
                    Total users over time <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Showing new users for the last 6 months
                </div>
            </FrameFooter>
        </Frame>
    );
}
