export interface DeskAnimationEvent<T extends string = string> {
    duration: number; // ms
    elapsedDuration: number; // ms
    animationType: T;
}

export enum NotebookAnimationType {
    ForwardFlip = 'FORWARD_FLIP',
    BackwardFlip = 'BACKWARD_FLIP',
};

export interface NotebookAnimationEvent extends DeskAnimationEvent<NotebookAnimationType> { }

