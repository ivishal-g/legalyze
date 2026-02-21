import type { Dictionary } from "@repo/internationalization";
import { AlertTriangle, Download, FileEdit, MessageSquare } from "lucide-react";

type FeaturesProps = {
  dictionary: Dictionary;
};

const featureIcons = [AlertTriangle, MessageSquare, FileEdit, Download];

export const Features = ({ dictionary }: FeaturesProps) => (
  <div className="w-full py-12 lg:py-20">
    <div className="container mx-auto">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="max-w-xl font-semibold text-3xl tracking-tight md:text-4xl">
            {dictionary.web.home.features.title}
          </h2>
          <p className="max-w-xl text-base text-muted-foreground leading-relaxed">
            {dictionary.web.home.features.description}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {dictionary.web.home.features.items.map((item, index) => {
            const Icon = featureIcons[index];
            return (
              <div
                className="flex flex-col gap-3 rounded-lg border bg-muted/50 p-5"
                key={item.title}
              >
                <Icon className="h-5 w-5 text-primary" />
                <div className="flex flex-col gap-1">
                  <h3 className="font-medium text-base tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);
