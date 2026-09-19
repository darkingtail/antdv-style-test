import { createStyles } from 'antdv-style'

// This syntax is valid TypeScript, but not TSX.
// @ts-expect-error TS1294: Deliberate parser fixture in an erasableSyntaxOnly project.
const width = <number>37
export const useAssertionStyles = createStyles(() => ({
  root: { width, height: 12, backgroundColor: 'teal' },
}))
