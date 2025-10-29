// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chart.bar.fill': 'bar-chart',
  'plus': 'add',
  'checkmark.circle.fill': 'check-circle',
  'xmark.circle.fill': 'cancel',
  'gearshape.fill': 'settings',
  'person.fill': 'person',
  'list.bullet': 'list',
  'trash': 'delete',
  'flame.fill': 'local-fire-department',
  'exclamationmark.triangle.fill': 'warning',
  'circle.fill': 'radio-button-unchecked',
  'checkmark.circle.fill': 'check-circle',
  'checkmark': 'check',
  'star.fill': 'star',
  'hammer.fill': 'build',
  'robot.fill': 'android',
  'leaf.fill': 'eco',
  'cloud.fill': 'cloud',
  'person.2.fill': 'group',
  'doc.text.fill': 'description',
  'widget': 'widgets',
  'square.and.arrow.up': 'share',
  'folder.fill': 'folder',
  'drop.fill': 'water-drop',
  'figure.run': 'directions-run',
  'book.fill': 'menu-book',
  'brain.head.profile': 'psychology',
  'laptopcomputer': 'laptop',
  'heart.fill': 'favorite',
  'briefcase.fill': 'work',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
