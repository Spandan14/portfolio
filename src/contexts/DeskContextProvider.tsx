import { createContext, useRef } from "react";
import { NotebookAnimationEvent } from "../utils/Animations";

interface DeskContextInterface {
  notebookAnimationEventQueue: React.RefObject<NotebookAnimationEvent[]>;
  pushNotebookAnimationEventQueue: (event: NotebookAnimationEvent) => void;
  popNotebookAnimationEventQueue: () => NotebookAnimationEvent | undefined;
}

interface ContextProviderProps {
  children: React.ReactNode;
}

const DeskContext = createContext<DeskContextInterface | undefined>(undefined);

export const DeskContextProvider = ({ children }: ContextProviderProps) => {
  const notebookAnimationEventQueue = useRef<NotebookAnimationEvent[]>([]);

  const pushNotebookAnimationEventQueue = (event: NotebookAnimationEvent) => {
    notebookAnimationEventQueue.current.push(event);
  }

  const popNotebookAnimationEventQueue = (): NotebookAnimationEvent | undefined => {
    return notebookAnimationEventQueue.current.shift() as NotebookAnimationEvent;
  }

  return (
    <DeskContext.Provider value={{ notebookAnimationEventQueue, pushNotebookAnimationEventQueue, popNotebookAnimationEventQueue }}>
      {children}
    </DeskContext.Provider>
  );
}

export default DeskContext;
