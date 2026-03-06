import { Layout } from "@/components/Layout";
import { PricingBanner } from "@/components/PricingBanner";
import { SEOHead } from "@/components/SEOHead";

const PricingDemo = () => {
  return (
    <Layout>
      <SEOHead />
      <section className="pt-8 pb-12">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 max-w-md mx-auto space-y-6">
          <h1 className="text-xl font-bold text-foreground text-center">Pricing Preview</h1>
          <PricingBanner />
        </div>
      </section>
    </Layout>
  );
};

export default PricingDemo;
