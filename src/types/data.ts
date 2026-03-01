import { Schema } from 'mongoose';

export interface IUser {
    name: string;
    email: string;
    profile?:string;
    createdAt?: string;
    updatedAt?: string;
}

export interface IProject {
    userMail: string;
    name: string;
    createdAt?: string;
    updatedAt?: string;
    episodes: number;
}

export interface IEpisode {
    name: string;
    description: string;
    method: 'youtube' | 'spotify' | 'rss';
    projectId: Schema.Types.ObjectId;
    deleted?: Boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export enum IconPosition {
    TopLeft = 'top-left',
    TopRight = 'top-right',
    BottomLeft = 'bottom-left',
    BottomRight = 'bottom-right',
    Center = 'center',
    TopCenter = 'top-center',
    BottomCenter = 'bottom-center',
    LeftCenter = 'left-center',
    RightCenter = 'right-center',
}

export enum IconSize {
    Small = '48',
    Medium = '64',
    Large = '96',
}

export interface IWidgetGeneralConfig {
    inputPlaceholder: string;
    welcomeMessage: string;
    chatbotName: string;
}

export interface IWidget {
    projectId: Schema.Types.ObjectId;
    chatbotName: string;
    welcomeMessage: string;
    inputPlaceholder: string;
    primaryColor: string;
    fontColor: string;
    fontSize: string;
    chatHeight: number;
    showSource: boolean;
    IconSize: IconSize;
    position: IconPosition;
    distanceFromBottom: number;
    horizontalDistance: number;
    image: string;
    createdAt?: Date;
    updatedAt?: Date;
}
