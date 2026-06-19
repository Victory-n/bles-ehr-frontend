import { prisma } from "@/lib/prisma";

export const folderService = {
  async createPatientFolders(patientId: string, userId: string) {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const parentFolderId = `FLD-${randomNum}`;

    const parentFolder = await prisma.folder.create({
      data: {
        folderId: parentFolderId,
        name: "Patient Documents",
        type: "PARENT",
        patientId,
        sortOrder: 0,
      },
    });

    const childFolders = [
      { name: "General Documents", type: "CHILD", sortOrder: 1 },
      { name: "Billing Documents", type: "CHILD", sortOrder: 2 },
      { name: "Compliance/Consent Forms", type: "CHILD", sortOrder: 3 },
      { name: "Clinic Notes", type: "CHILD", sortOrder: 4 },
    ];

    const createdChildFolders = await Promise.all(
      childFolders.map((folder, index) => {
        const childRandomNum = Math.floor(10000 + Math.random() * 90000);
        return prisma.folder.create({
          data: {
            folderId: `FLD-${childRandomNum}`,
            name: folder.name,
            type: folder.type as any,
            patientId,
            parentId: parentFolder.id,
            sortOrder: folder.sortOrder,
          },
        });
      })
    );

    return { parent: parentFolder, children: createdChildFolders };
  },

  async getPatientFolders(patientId: string) {
    return await prisma.folder.findMany({
      where: { patientId, deletedAt: null },
      include: { children: true, documents: true },
      orderBy: { sortOrder: "asc" },
    });
  },
};
