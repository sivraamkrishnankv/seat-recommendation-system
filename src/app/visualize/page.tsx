import { Suspense } from "react";
import VisualizeClient from "./visualize-client";

export default function VisualizePage() {
  return (
    <Suspense>
      <VisualizeClient />
    </Suspense>
  );
}



