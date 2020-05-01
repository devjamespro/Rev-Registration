declare namespace CollapsedCourseCardCssModule {
  export interface ICollapsedCourseCardCss {
    "custom-box": string;
    customBox: string;
    "maroon-card": string;
    maroonCard: string;
  }
}

declare const CollapsedCourseCardCssModule: CollapsedCourseCardCssModule.ICollapsedCourseCardCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CollapsedCourseCardCssModule.ICollapsedCourseCardCss;
};

export = CollapsedCourseCardCssModule;
