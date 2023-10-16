import { css } from "lit";

/* 
Structure for core tokens: --namespace-object-attribute-variant
  namespace = np-core
  object = color, text
  attribute = blue, size
  variant = x, l, ls, xl
*/

export const core = css`
  :host {
    --np-core-color-green-xs: hsla(117, 40%, 36%, 1);
    --np-core-color-green-s: hsla(117, 40%, 46%, 1);
    --np-core-color-green-m: hsla(117, 40%, 56%, 1);
    --np-core-color-green-l: hsla(117, 40%, 66%, 1);
    --np-core-color-green-xl: hsla(117, 40%, 76%, 1);

    --np-core-color-red-xs: hsla(2, 79%, 49%, 1);
    --np-core-color-red-s: hsla(2, 79%, 59%, 1);
    --np-core-color-red-m: hsla(2, 79%, 69%, 1);
    --np-core-color-red-l: hsla(2, 79%, 79%, 1);
    --np-core-color-red-xl: hsla(2, 79%, 89%, 1);

    --np-core-color-blue-xs: hsl(208, 80%, 30%);
    --np-core-color-blue-s: hsl(208, 80%, 40%);
    --np-core-color-blue-m: hsl(208, 80%, 50%);
    --np-core-color-blue-l: hsl(208, 80%, 60%);
    --np-core-color-blue-xl: hsl(208, 80%, 70%);

    --np-core-color-grey-xs: hsla(270, 10%, 10%, 1);
    --np-core-color-grey-s: hsla(270, 10%, 30%, 1);
    --np-core-color-grey-m: hsla(270, 10%, 50%, 1);
    --np-core-color-grey-l: hsla(270, 10%, 70%, 1);
    --np-core-color-grey-xl: hsla(270, 10%, 90%, 1);

    --np-core-color-black: hsla(270, 10%, 0%, 1);
    --np-core-color-white: hsla(270, 10%, 100%, 1);

    --np-core-color-purple-xs: hsla(270, 69%, 20%);
    --np-core-color-purple-s: hsla(270, 69%, 30%);
    --np-core-color-purple-m: hsla(270, 69%, 40%);
    --np-core-color-purple-l: hsla(270, 69%, 50%);
    --np-core-color-purple-xl: hsla(270, 69%, 60%);

    --np-core-color-pink-xs: hsl(330, 100%, 30%, 1);
    --np-core-color-pink-s: hsl(330, 100%, 40%, 1);
    --np-core-color-pink-m: hsl(330, 100%, 50%, 1);
    --np-core-color-pink-l: hsl(330, 100%, 60%, 1);
    --np-core-color-pink-xl: hsl(330, 100%, 70%, 1);
  }

  :host {
    --np-core-gradient-purple-pink: linear-gradient(
      45deg,
      var(--np-core-color-purple-m),
      var(--np-core-color-pink-m)
    );
    --np-core-gradient-blue-green: linear-gradient(
      45deg,
      var(--np-core-color-blue-m),
      var(--np-core-color-green-m)
    );
  }

  :host {
    --np-core-padding-xs: 0.2em;
    --np-core-padding-s: 0.5em;
    --np-core-padding-m: 1em;
    --np-core-padding-l: 1.5em;
    --np-core-padding-xl: 2em;
  }

  :host {
    --np-core-border-width-xs: 1px;
    --np-core-border-width-s: 2px;
    --np-core-border-width-m: 3px;
    --np-core-border-width-l: 4px;
    --np-core-border-width-xl: 5px;
  }

  :host {
    --np-core-border-radius-xs: 0.1em;
    --np-core-border-radius-s: 0.2em;
    --np-core-border-radius-m: 0.4em;
    --np-core-border-radius-l: 0.6em;
    --np-core-border-radius-xl: 0.8em;
  }

  :host {
    --np-core-font-size-xs: 0.6em;
    --np-core-font-size-s: 0.8em;
    --np-core-font-size-m: 1em;
    --np-core-font-size-l: 1.2em;
    --np-core-font-size-xl: 1.4em;

    --np-core-font-weight-xs: 200;
    --np-core-font-weight-s: 300;
    --np-core-font-weight-m: 400;
    --np-core-font-weight-l: 500;
    --np-core-font-weight-xl: 600;
  }

  :host {
    --np-core-icon-gap: var(--np-core-padding-s);
  }
`;
