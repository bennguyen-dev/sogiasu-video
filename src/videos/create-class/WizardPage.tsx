import type React from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import DashboardHeader from "@/shared/components/layouts/dashboard/header";
import DashboardMain from "@/shared/components/layouts/dashboard/main";
import PageHeader from "@/shared/components/layouts/dashboard/PageHeader";
import WizardStepper from "@/features/class/components/CreateClassWizard/WizardStepper";

// CreateClassWizard's own markup (app/dashboard/classes/new): its forms live inside it, so a scene
// that needs to drive them frame by frame lays the same shell around forms it owns
export const WizardPage = ({ step, children }: { readonly step: number; readonly children: React.ReactNode }) => {
  const t = useTranslations("class");
  const steps = [{ title: t("wizard.steps.info") }, { title: t("wizard.steps.students") }, { title: t("wizard.steps.schedule") }];

  return (
    <>
      <DashboardHeader>
        <PageHeader backHref="/dashboard/classes">{t("wizard.title")}</PageHeader>
      </DashboardHeader>
      <DashboardMain>
        <div className="max-w-3xl mx-auto w-full">
          <div className="mb-6">
            <WizardStepper steps={steps} current={step} />
          </div>
          {children}
          <div className="h-20" />
        </div>
      </DashboardMain>
    </>
  );
};

// the wizard's sticky footer, pinned to the bottom of the phone (the series hides the bottom nav it sits on in the app)
export const WizardFooter = ({ step, lessons = 0 }: { readonly step: number; readonly lessons?: number }) => {
  const t = useTranslations("class");

  return (
    <div className="fixed inset-x-0 bottom-0 z-10 px-4 py-3 bg-background border-t flex items-center justify-between gap-3">
      <Button variant="outline" size="lg">
        <ArrowLeft className="h-4 w-4" />
        {t("wizard.back")}
      </Button>
      {step < 2 ? (
        <Button size="lg" data-footer-next>
          {t("wizard.next")}
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      ) : (
        <Button size="lg" data-footer-next disabled={lessons === 0}>
          <Check className="h-4 w-4" />
          {t("wizard.submit", { count: lessons })}
        </Button>
      )}
    </div>
  );
};
