-- CreateTable
CREATE TABLE `PublicPdf` (
    `id` VARCHAR(191) NOT NULL,
    `singleton` INTEGER NOT NULL DEFAULT 1,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `uploadedById` VARCHAR(191) NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `PublicPdf_singleton_key`(`singleton`),
    INDEX `PublicPdf_uploadedAt_idx`(`uploadedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessibilityTerms` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Faq` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FaqItem` (
    `id` VARCHAR(191) NOT NULL,
    `faqId` VARCHAR(191) NOT NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `header` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FaqItem_faqId_sort_idx`(`faqId`, `sort`),
    UNIQUE INDEX `FaqItem_faqId_sort_key`(`faqId`, `sort`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TermsOfUse` (
    `id` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedById` VARCHAR(191) NULL,

    INDEX `TermsOfUse_updatedAt_idx`(`updatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserTermsOfUseAcceptance` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `termsId` VARCHAR(191) NOT NULL,
    `acceptedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ip` VARCHAR(45) NULL,
    `userAgent` VARCHAR(255) NULL,

    INDEX `UserTermsOfUseAcceptance_userId_acceptedAt_idx`(`userId`, `acceptedAt`),
    INDEX `UserTermsOfUseAcceptance_termsId_acceptedAt_idx`(`termsId`, `acceptedAt`),
    UNIQUE INDEX `UserTermsOfUseAcceptance_userId_termsId_key`(`userId`, `termsId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PrivacyPolicy` (
    `id` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedById` VARCHAR(191) NULL,

    INDEX `PrivacyPolicy_updatedAt_idx`(`updatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserPrivacyPolicyAcceptance` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `privacyPolicyId` VARCHAR(191) NOT NULL,
    `acceptedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ip` VARCHAR(45) NULL,
    `userAgent` VARCHAR(255) NULL,

    INDEX `UserPrivacyPolicyAcceptance_userId_acceptedAt_idx`(`userId`, `acceptedAt`),
    INDEX `UserPrivacyPolicyAcceptance_privacyPolicyId_acceptedAt_idx`(`privacyPolicyId`, `acceptedAt`),
    UNIQUE INDEX `UserPrivacyPolicyAcceptance_userId_privacyPolicyId_key`(`userId`, `privacyPolicyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessibilityStatement` (
    `id` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedById` VARCHAR(191) NULL,

    INDEX `AccessibilityStatement_updatedAt_idx`(`updatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImprintStatement` (
    `id` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedById` VARCHAR(191) NULL,

    INDEX `ImprintStatement_updatedAt_idx`(`updatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `phonenumber` VARCHAR(191) NULL,
    `salutationType` ENUM('MR', 'MS', 'MX', 'PREFER_NOT_TO_SAY') NOT NULL,
    `title` VARCHAR(191) NULL,
    `role` ENUM('USER', 'ADMIN', 'MODERATOR') NOT NULL DEFAULT 'USER',
    `accountState` ENUM('VERIFY_EMAIL', 'REGISTERED', 'REGISTRATION_REVOKED') NOT NULL DEFAULT 'VERIFY_EMAIL',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdById` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `emailVerifiedAt` DATETIME(3) NULL,
    `hasAcceptedTerms` BOOLEAN NOT NULL DEFAULT false,
    `hasAcceptedPrivacyPolicy` BOOLEAN NOT NULL DEFAULT false,
    `organizationId` VARCHAR(191) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_organizationId_idx`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Organization` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdById` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `street` VARCHAR(191) NULL,
    `zip` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NULL,
    `countryId` VARCHAR(191) NOT NULL,
    `regionId` VARCHAR(191) NULL,
    `organizationType` ENUM('INDUSTRY', 'CRAFT', 'STARTUP', 'COLLEGE_UNIVERSITY', 'RESEARCH_INSTITUTE', 'MUNICIPALITY', 'MUNICIPAL_ORGANIZATION', 'ASSOCIATION', 'SME') NULL,
    `organizationState` ENUM('LITE', 'FULL') NOT NULL,
    `website` VARCHAR(191) NULL,
    `logoBase64` LONGTEXT NULL,
    `logoMimeType` VARCHAR(191) NULL,
    `logoFilename` VARCHAR(191) NULL,
    `manualCoords` BOOLEAN NULL DEFAULT false,
    `lat` DOUBLE NULL,
    `lon` DOUBLE NULL,

    UNIQUE INDEX `Organization_email_key`(`email`),
    UNIQUE INDEX `Organization_name_key`(`name`),
    INDEX `Organization_countryId_idx`(`countryId`),
    INDEX `Organization_regionId_idx`(`regionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MunicipalityProfile` (
    `organizationId` VARCHAR(191) NOT NULL,
    `population` INTEGER UNSIGNED NOT NULL,

    INDEX `MunicipalityProfile_population_idx`(`population`),
    PRIMARY KEY (`organizationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DigitalSolution` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `link` VARCHAR(191) NULL,
    `maturityDegree` ENUM('DEVELOPMENT_DEMONSTRATION_PHASE', 'IDEA_CONCEPT_STUDY', 'MARKET_READY_CONTINUOUS_OPERATION', 'TEST_PHASE_PROTOTYPE') NULL,
    `offeringCategory` ENUM('SERVICE', 'RESEARCH', 'COMPLETE_SOLUTION', 'PRODUCT', 'PROJECT', 'IMPLEMENTATION_ROADMAP') NULL,
    `shortDescription` TEXT NULL,
    `longDescription` TEXT NULL,
    `goalDescription` TEXT NULL,
    `technicalDescription` TEXT NULL,
    `efficiencyDescription` TEXT NULL,
    `processDescription` TEXT NULL,
    `socialRelevanceDescription` TEXT NULL,
    `hasAcceptedTerms` BOOLEAN NOT NULL DEFAULT false,
    `hasAcceptedPrivacyPolicy` BOOLEAN NOT NULL DEFAULT false,
    `presentedByUserId` VARCHAR(191) NULL,
    `solutionPresentedByUser` BOOLEAN NULL,
    `state` ENUM('DRAFT', 'REQUESTED', 'ACTIVATED', 'DEACTIVATED') NOT NULL DEFAULT 'REQUESTED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAtOverride` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdById` VARCHAR(191) NULL,
    `readyForOperation` DATETIME(3) NULL,
    `organizationId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `publishedBy` ENUM('OWNER', 'ADMIN', 'WEB', 'PUBLICATION') NULL,
    `publishedAt` DATETIME(3) NULL,
    `publishedSource` VARCHAR(2048) NULL,

    INDEX `DigitalSolution_organizationId_idx`(`organizationId`),
    INDEX `DigitalSolution_userId_idx`(`userId`),
    INDEX `DigitalSolution_publishedAt_idx`(`publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaxonomyNode` (
    `id` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `type` VARCHAR(64) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `nameDe` VARCHAR(255) NOT NULL,
    `nameEn` VARCHAR(255) NULL,
    `path` VARCHAR(768) NOT NULL,
    `depth` INTEGER NOT NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `isFav` BOOLEAN NOT NULL DEFAULT false,
    `color` VARCHAR(191) NULL,
    `maxSelectableNodes` INTEGER NULL,
    `minSelectableNodes` INTEGER NULL,

    INDEX `TaxonomyNode_path_idx`(`path`),
    INDEX `TaxonomyNode_depth_idx`(`depth`),
    INDEX `TaxonomyNode_type_depth_sort_idx`(`type`, `depth`, `sort`),
    UNIQUE INDEX `TaxonomyNode_slug_key`(`slug`),
    UNIQUE INDEX `TaxonomyNode_path_key`(`path`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DigitalSolutionTaxonomy` (
    `digitalSolutionId` VARCHAR(191) NOT NULL,
    `taxonomyNodeId` VARCHAR(191) NOT NULL,

    INDEX `DigitalSolutionTaxonomy_taxonomyNodeId_idx`(`taxonomyNodeId`),
    INDEX `DigitalSolutionTaxonomy_digitalSolutionId_idx`(`digitalSolutionId`),
    PRIMARY KEY (`digitalSolutionId`, `taxonomyNodeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Image` (
    `id` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `path` TEXT NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `contentHash` CHAR(64) NULL,
    `type` ENUM('TITLE', 'DETAIL') NOT NULL,
    `digitalSolutionId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Country` (
    `code` VARCHAR(2) NOT NULL,
    `nameDe` VARCHAR(191) NOT NULL,
    `nameEn` VARCHAR(191) NULL,

    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Region` (
    `id` VARCHAR(191) NOT NULL,
    `countryId` VARCHAR(191) NOT NULL,
    `code` VARCHAR(16) NOT NULL,
    `nameDe` VARCHAR(191) NOT NULL,
    `nameEn` VARCHAR(191) NULL,
    `adminLevel` INTEGER NOT NULL DEFAULT 1,

    INDEX `Region_countryId_idx`(`countryId`),
    UNIQUE INDEX `Region_countryId_code_key`(`countryId`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Token` (
    `id` VARCHAR(191) NOT NULL,
    `tokenHash` CHAR(64) NOT NULL,
    `tokenType` ENUM('REGISTRATION_SUCCESSFUL_TOKEN', 'REFRESH_TOKEN', 'PASSWORD_RESET_TOKEN', 'EMAIL_VERIFICATION_TOKEN', 'REVOKE_REGISTRATION_TOKEN', 'REVOKE_REGISTRATION_SUCCESSFUL_TOKEN') NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Token_tokenHash_key`(`tokenHash`),
    INDEX `Token_userId_idx`(`userId`),
    INDEX `Token_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ProjectPartnerToDigitalSolutions` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ProjectPartnerToDigitalSolutions_AB_unique`(`A`, `B`),
    INDEX `_ProjectPartnerToDigitalSolutions_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_SolutionUsersToDigitalSolutions` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_SolutionUsersToDigitalSolutions_AB_unique`(`A`, `B`),
    INDEX `_SolutionUsersToDigitalSolutions_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PublicPdf` ADD CONSTRAINT `PublicPdf_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FaqItem` ADD CONSTRAINT `FaqItem_faqId_fkey` FOREIGN KEY (`faqId`) REFERENCES `Faq`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TermsOfUse` ADD CONSTRAINT `TermsOfUse_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTermsOfUseAcceptance` ADD CONSTRAINT `UserTermsOfUseAcceptance_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTermsOfUseAcceptance` ADD CONSTRAINT `UserTermsOfUseAcceptance_termsId_fkey` FOREIGN KEY (`termsId`) REFERENCES `TermsOfUse`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrivacyPolicy` ADD CONSTRAINT `PrivacyPolicy_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPrivacyPolicyAcceptance` ADD CONSTRAINT `UserPrivacyPolicyAcceptance_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPrivacyPolicyAcceptance` ADD CONSTRAINT `UserPrivacyPolicyAcceptance_privacyPolicyId_fkey` FOREIGN KEY (`privacyPolicyId`) REFERENCES `PrivacyPolicy`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessibilityStatement` ADD CONSTRAINT `AccessibilityStatement_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImprintStatement` ADD CONSTRAINT `ImprintStatement_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Organization` ADD CONSTRAINT `Organization_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Organization` ADD CONSTRAINT `Organization_countryId_fkey` FOREIGN KEY (`countryId`) REFERENCES `Country`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Organization` ADD CONSTRAINT `Organization_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `Region`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MunicipalityProfile` ADD CONSTRAINT `MunicipalityProfile_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DigitalSolution` ADD CONSTRAINT `DigitalSolution_presentedByUserId_fkey` FOREIGN KEY (`presentedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DigitalSolution` ADD CONSTRAINT `DigitalSolution_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DigitalSolution` ADD CONSTRAINT `DigitalSolution_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DigitalSolution` ADD CONSTRAINT `DigitalSolution_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaxonomyNode` ADD CONSTRAINT `TaxonomyNode_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `TaxonomyNode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DigitalSolutionTaxonomy` ADD CONSTRAINT `DigitalSolutionTaxonomy_digitalSolutionId_fkey` FOREIGN KEY (`digitalSolutionId`) REFERENCES `DigitalSolution`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DigitalSolutionTaxonomy` ADD CONSTRAINT `DigitalSolutionTaxonomy_taxonomyNodeId_fkey` FOREIGN KEY (`taxonomyNodeId`) REFERENCES `TaxonomyNode`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Image` ADD CONSTRAINT `Image_digitalSolutionId_fkey` FOREIGN KEY (`digitalSolutionId`) REFERENCES `DigitalSolution`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Region` ADD CONSTRAINT `Region_countryId_fkey` FOREIGN KEY (`countryId`) REFERENCES `Country`(`code`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Token` ADD CONSTRAINT `Token_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProjectPartnerToDigitalSolutions` ADD CONSTRAINT `_ProjectPartnerToDigitalSolutions_A_fkey` FOREIGN KEY (`A`) REFERENCES `DigitalSolution`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProjectPartnerToDigitalSolutions` ADD CONSTRAINT `_ProjectPartnerToDigitalSolutions_B_fkey` FOREIGN KEY (`B`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SolutionUsersToDigitalSolutions` ADD CONSTRAINT `_SolutionUsersToDigitalSolutions_A_fkey` FOREIGN KEY (`A`) REFERENCES `DigitalSolution`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SolutionUsersToDigitalSolutions` ADD CONSTRAINT `_SolutionUsersToDigitalSolutions_B_fkey` FOREIGN KEY (`B`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
