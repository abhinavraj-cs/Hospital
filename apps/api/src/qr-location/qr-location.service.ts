import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, QRCodeLocation } from '@prisma/client';
import * as qrcode from 'qrcode';
import { NavigationService } from '../navigation/navigation.service';

@Injectable()
export class QrLocationService {
  constructor(
    private prisma: PrismaService,
    private navigationService: NavigationService,
  ) {}

  async create(data: Prisma.QRCodeLocationUncheckedCreateInput): Promise<QRCodeLocation> {
    return this.prisma.qRCodeLocation.create({ data });
  }

  async findAll(): Promise<QRCodeLocation[]> {
    return this.prisma.qRCodeLocation.findMany({
      include: {
        node: true,
      },
    });
  }

  async findOne(id: string): Promise<QRCodeLocation> {
    const qrLocation = await this.prisma.qRCodeLocation.findUnique({
      where: { id },
      include: {
        node: true,
      },
    });

    if (!qrLocation) {
      throw new NotFoundException(`QR Code location with ID ${id} not found`);
    }

    return qrLocation;
  }

  async update(id: string, data: Prisma.QRCodeLocationUpdateInput): Promise<QRCodeLocation> {
    try {
      return await this.prisma.qRCodeLocation.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new NotFoundException(`QR Code location with ID ${id} not found`);
    }
  }

  async remove(id: string): Promise<QRCodeLocation> {
    try {
      return await this.prisma.qRCodeLocation.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`QR Code location with ID ${id} not found`);
    }
  }

  /**
   * Process a QR scan by a patient
   */
  async processScan(code: string) {
    const qrLocation = await this.prisma.qRCodeLocation.findUnique({
      where: { code },
      include: {
        node: {
          include: {
            floor: {
              include: {
                building: true,
              },
            },
          },
        },
      },
    });

    if (!qrLocation || !qrLocation.active) {
      throw new BadRequestException('Invalid or inactive QR code');
    }

    // Find nearby departments on the same floor
    const nearbyDepartments = await this.prisma.department.findMany({
      where: { floorId: qrLocation.node.floorId },
      include: {
        navigationNodes: {
          where: { nodeType: 'DEPARTMENT' },
          take: 1,
        },
      },
    });

    return {
      locationNode: qrLocation.node,
      nearbyDepartments: nearbyDepartments
        .filter((d) => d.navigationNodes.length > 0)
        .map((d) => ({
          id: d.id,
          name: d.name,
          nodeId: d.navigationNodes[0].id,
        })),
    };
  }

  /**
   * Generate QR Code image data URI
   */
  async generateImage(code: string): Promise<string> {
    try {
      // In a real app, this might point to a frontend deep link
      // e.g. `https://hospital-nav.com/scan?c=${code}`
      return await qrcode.toDataURL(code);
    } catch (error) {
      throw new BadRequestException('Failed to generate QR code image');
    }
  }
}
