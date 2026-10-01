-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT,
    "source" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "priceMessage" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
