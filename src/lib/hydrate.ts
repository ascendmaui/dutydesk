import { useEffect } from "react";
import { useDesk } from "./store";

export function DeskHydrator() {
  useEffect(() => {
    void useDesk.persist.rehydrate();
  }, []);
  return null;
}
