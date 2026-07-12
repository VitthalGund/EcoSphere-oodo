import React from "react";
import { Card } from "../components/Card";
import { Sparkles } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <div className="space-y-6">
      <Card
        title={`${title} Module`}
        subtitle="Under construction for subsequent phases of the EcoSphere demo"
        accent="primary"
      >
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-2xl animate-bounce">
            🌱
          </div>
          <div className="space-y-2 max-w-md">
            <h2 className="text-xl font-black text-text-primary">
              Feature Placeholder
            </h2>
            <p className="text-sm text-text-secondary">
              The <strong>{title}</strong> page has been scaffolded and
              connected to the navigation shell. It will be fully populated with
              real interactive data in the next phases.
            </p>
          </div>
          <div className="inline-flex items-center space-x-1.5 text-xs text-governance font-bold bg-governance/10 px-3 py-1 rounded-full">
            <Sparkles className="h-3 w-3 fill-governance/25" />
            <span>Ready for Phase 2 Implementation</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
