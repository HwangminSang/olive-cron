export const isPushAuth = (role: string): boolean => {
  const accessRole: Array<string> = ['SUPERADMIN', 'ADMIN', 'SYSTEM', 'MARKETER']
  if (accessRole.includes(role)) {
    return true
  }
  return false
}
