/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, useColorScheme, View as DefaultView, TextInput as DefaultTextInput } from 'react-native';
import { FontAwesome as DefaultFontAwesome } from '@expo/vector-icons';
import {default as DefaultDropDownPicker, DropDownPickerProps as DefaultDropDownPickerProps, ValueType, ThemeNameType } from 'react-native-dropdown-picker';

import Colors from '../constants/Colors';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

type ThemeTextInputProps = { 
  lightPlaceholderTextColor?: string;
  darkPlaceholderTextColor?: string;
}

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];
export type TextInputProps = ThemeProps & DefaultTextInput['props'] & ThemeTextInputProps;
export type FontAwesomeProps = ThemeProps & DefaultFontAwesome['props'];
export type DropDownPickerProps = ThemeProps & DefaultDropDownPickerProps<ValueType>;

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function TextInput(props: TextInputProps) {
  const { style, lightColor, darkColor, lightPlaceholderTextColor, darkPlaceholderTextColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const placeholderTextColor = useThemeColor({ light: lightPlaceholderTextColor, dark: darkPlaceholderTextColor }, 'placeholderText');

  return <DefaultTextInput style={[{ color }, style]} placeholderTextColor={placeholderTextColor} {...otherProps} />;
}

export function FontAwesome(props: FontAwesomeProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultFontAwesome style={[{ color }, style]} {...otherProps} />;
}

export function FontAwesomeButton(props: FontAwesomeProps) {
  const { lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultFontAwesome.Button color={color} {...otherProps} />;
}

export function DropDownPicker(props: DropDownPickerProps) {
  const theme: ThemeNameType = useColorScheme()?.toUpperCase() == 'DARK' ? 'DARK' : 'LIGHT';
  return <DefaultDropDownPicker {...props} theme={theme}/>;
}