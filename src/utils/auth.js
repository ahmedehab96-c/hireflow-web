/** Where each role lands after signing in. */
export const homeFor = (user) => (user?.role === 'admin' ? '/admin' : '/app')
