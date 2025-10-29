import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

interface ProgressChartProps {
  data: number[]; // Array of completion percentages for each day
  colors?: string[];
}

export function ProgressChart({ data, colors }: ProgressChartProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  
  const chartWidth = 280;
  const chartHeight = 120;
  const barWidth = chartWidth / data.length - 8;
  const maxValue = Math.max(...data, 100);
  
  const defaultColors = [
    themeColors.background,
    '#FF6B35', // Orange
    themeColors.background,
    '#FF6B35', // Orange
    '#FF6B35', // Orange
  ];

  const chartColors = colors || defaultColors;

  // Calculate bar heights
  const bars = data.map((value, index) => ({
    x: index * (barWidth + 8) + 4,
    height: (value / maxValue) * chartHeight,
    y: chartHeight - (value / maxValue) * chartHeight,
    color: chartColors[index % chartColors.length],
  }));

  // Create trend arrow path
  const createTrendPath = () => {
    if (bars.length < 2) return '';
    
    let path = `M ${bars[0].x + barWidth/2} ${bars[0].y}`;
    
    for (let i = 1; i < bars.length; i++) {
      const x = bars[i].x + barWidth/2;
      const y = bars[i].y;
      path += ` L ${x} ${y}`;
    }
    
    return path;
  };

  const trendPath = createTrendPath();

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Weekly Progress Trend
      </ThemedText>
      
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight} style={styles.chart}>
          <Defs>
            <LinearGradient id="orangeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FF6B35" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#FF6B35" stopOpacity="1" />
            </LinearGradient>
            <LinearGradient id="whiteGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={themeColors.background} stopOpacity="0.8" />
              <Stop offset="100%" stopColor={themeColors.background} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          
          {/* Bars */}
          {bars.map((bar, index) => (
            <Rect
              key={index}
              x={bar.x}
              y={bar.y}
              width={barWidth}
              height={bar.height}
              fill={bar.color === '#FF6B35' ? 'url(#orangeGradient)' : 'url(#whiteGradient)'}
              rx={4}
              ry={4}
            />
          ))}
          
          {/* Trend Arrow */}
          {trendPath && (
            <Path
              d={trendPath}
              stroke="#FFD700" // Golden yellow
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          
          {/* Arrowhead */}
          {bars.length > 1 && (
            <Path
              d={`M ${bars[bars.length - 1].x + barWidth/2 - 6} ${bars[bars.length - 1].y - 6} L ${bars[bars.length - 1].x + barWidth/2} ${bars[bars.length - 1].y} L ${bars[bars.length - 1].x + barWidth/2 - 6} ${bars[bars.length - 1].y + 6}`}
              stroke="#FFD700"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </Svg>
        
        {/* Day labels */}
        <View style={styles.labelsContainer}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
            <ThemedText key={day} style={styles.dayLabel}>
              {day}
            </ThemedText>
          ))}
        </View>
      </View>
      
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: themeColors.background }]} />
          <ThemedText style={styles.legendText}>Completed</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FF6B35' }]} />
          <ThemedText style={styles.legendText}>Target</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FFD700' }]} />
          <ThemedText style={styles.legendText}>Trend</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chart: {
    marginBottom: 8,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 280,
    paddingHorizontal: 4,
  },
  dayLabel: {
    fontSize: 10,
    opacity: 0.7,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 10,
    opacity: 0.7,
  },
});
