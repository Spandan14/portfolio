import { useContext } from "react";
import DeskContext from "./DeskContextProvider";

export const useDeskContext = () => {
  const context = useContext(DeskContext);
  if (context === undefined) {
    throw new Error('useDeskContext must be used within an DeskContextProvider');
  }

  return context;
}
