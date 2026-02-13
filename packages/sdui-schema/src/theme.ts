type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface SDUITheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    border: string;
  };
  typography: {
    fontFamily: {
      heading: string;
      body: string;
      mono: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      "2xl": string;
      "3xl": string;
      "4xl": string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export type SDUIThemeOverrides = DeepPartial<SDUITheme>;
