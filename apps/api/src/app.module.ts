import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HospitalsModule } from './hospitals/hospitals.module';
import { BuildingsModule } from './buildings/buildings.module';
import { FloorsModule } from './floors/floors.module';
import { DepartmentsModule } from './departments/departments.module';
import { RoomsModule } from './rooms/rooms.module';
import { DoctorsModule } from './doctors/doctors.module';
import { NavigationModule } from './navigation/navigation.module';
import { QueuesModule } from './queues/queues.module';
import { QrLocationModule } from './qr-location/qr-location.module';
import { EmergencyModule } from './emergency/emergency.module';
import { RealtimeModule } from './realtime/realtime.module';
import { AdminModule } from './admin/admin.module';
import { MultiQueueModule } from './multi-queue/multi-queue.module';

@Module({
  imports: [
    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
      },
    ]),

    // Core
    PrismaModule,
    AuthModule,
    UsersModule,

    // Hospital structure
    HospitalsModule,
    BuildingsModule,
    FloorsModule,
    DepartmentsModule,
    RoomsModule,

    // Features
    DoctorsModule,
    NavigationModule,
    QueuesModule,
    QrLocationModule,
    EmergencyModule,
    // Missing Modules Removed

    // Realtime & Health
    RealtimeModule,
    AdminModule,
    MultiQueueModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
