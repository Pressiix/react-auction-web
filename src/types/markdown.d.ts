declare module "*.md" {
  import { ReactElement } from "react";
  const content: {
    html: string;
    react: ReactElement;
  };
  export default content;
}

declare module "*.md?raw" {
  const content: string;
  export default content;
}
