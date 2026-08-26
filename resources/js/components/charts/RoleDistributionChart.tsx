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
import type { RoleDistribution } from '@/types';
import * as React from 'react';
import { Label, Pie, PieChart } from 'recharts';

interface RoleDistributionChartProps {
    data: RoleDistribution[];
}

export default function RoleDistributionChart({
    data,
}: RoleDistributionChartProps) {
    const chartData = React.useMemo(() => {
        return data.map((item, index) => ({
            ...item,
            fill: `var(--chart-${(index % 5) + 1})`,
        }));
    }, [data]);

    const totalUsers = React.useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.count, 0);
    }, [chartData]);

    const chartConfig = React.useMemo(() => {
        const config: ChartConfig = {
            count: {
                label: 'Users',
            },
        };

        chartData.forEach((item) => {
            config[item.name] = {
                label: item.name.charAt(0).toUpperCase() + item.name.slice(1),
                color: item.fill,
            };
        });

        return config;
    }, [chartData]);

    return (
        <Frame>
            <FrameHeader>
                <FrameTitle>Role Distribution</FrameTitle>
                <FrameDescription>User roles breakdown</FrameDescription>
            </FrameHeader>
            <FramePanel>
                <div className="flex-1 pb-0">
                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square max-h-[250px]"
                    >
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                                data={chartData}
                                dataKey="count"
                                nameKey="name"
                                innerRadius={60}
                                strokeWidth={5}
                            >
                                <Label
                                    content={({ viewBox }) => {
                                        if (
                                            viewBox &&
                                            'cx' in viewBox &&
                                            'cy' in viewBox
                                        ) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-foreground text-3xl font-bold"
                                                    >
                                                        {totalUsers.toLocaleString()}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={
                                                            (viewBox.cy || 0) +
                                                            24
                                                        }
                                                        className="fill-muted-foreground"
                                                    >
                                                        Total Users
                                                    </tspan>
                                                </text>
                                            );
                                        }
                                    }}
                                />
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </div>
            </FramePanel>
            <FrameFooter className="flex-col gap-2">
                <div className="leading-none text-muted-foreground">
                    Showing distribution of roles across all users
                </div>
            </FrameFooter>
        </Frame>
    );
}
