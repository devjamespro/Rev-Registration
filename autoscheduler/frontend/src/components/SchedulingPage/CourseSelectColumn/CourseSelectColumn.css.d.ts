declare namespace CourseSelectColumnCssNamespace {
  export interface ICourseSelectColumnCss {
    "add-course-button": string;
    addCourseButton: string;
    "button-container": string;
    buttonContainer: string;
    "column-wrapper": string;
    columnWrapper: string;
    container: string;
    "course-select-column": string;
    courseSelectColumn: string;
    "no-transition": string;
    noTransition: string;
    row: string;
  }
}

declare const CourseSelectColumnCssModule: CourseSelectColumnCssNamespace.ICourseSelectColumnCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CourseSelectColumnCssNamespace.ICourseSelectColumnCss;
};

export = CourseSelectColumnCssModule;
