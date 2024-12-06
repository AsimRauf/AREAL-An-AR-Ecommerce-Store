declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string
        ar?: boolean
        'ar-modes'?: string
        'camera-controls'?: boolean
        'shadow-intensity'?: string
        'ar-placement'?: string
        scale?: string
        style?: React.CSSProperties
      },
      HTMLElement
    >
  }
}
