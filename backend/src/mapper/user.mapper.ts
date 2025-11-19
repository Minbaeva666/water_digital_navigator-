// export const toUserDto = (user: User & { organization: Organization | null }): UserWithOrganizationDto => ({
//   id: user.id,
//   email: user.email,
//   firstName: user.firstName,
//   lastName: user.lastName,
//   salutationType: user.salutationType as SalutationType,
//   title: user.title ?? undefined,
//   phonenumber: user.phonenumber ?? undefined,
//   role: user.role as Role,
//   accountState: user.accountState as AccountState,
//   emailVerifiedAt: user.emailVerifiedAt ?? undefined,
//   hasAcceptedTerms: user.hasAcceptedTerms,
//   hasAcceptedPrivacyPolicy: user.hasAcceptedPrivacyPolicy,
//   organization: user.organization
//     ? { id: user.organization.id, name: user.organization.name }
//     : undefined,
// });