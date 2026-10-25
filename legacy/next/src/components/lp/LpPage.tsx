import LpNav from './LpNav'
import LpHero from './LpHero'
import LpPain from './LpPain'
import LpFeatures from './LpFeatures'
import LpMethod from './LpMethod'
import LpBenefits from './LpBenefits'
import LpComparison from './LpComparison'
import LpPricing from './LpPricing'
import LpFaq from './LpFaq'
import LpFounder from './LpFounder'
import LpFooter from './LpFooter'
import StickyCta from './StickyCta'
import './lp.css'

// The landing page is static: no app providers, no client state except the founder note.
export default function LpPage() {
  return (
    <div className="lp-root bg-white text-gray-900 antialiased pb-20 md:pb-0">
      {/* The app pages load Noto Sans JP via the system; the LP is outside the providers, so load it here */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap" />
      <LpNav />
      <main>
        <LpHero />
        <LpPain />
        <LpFeatures />
        <LpMethod />
        <LpBenefits />
        <LpComparison />
        <LpPricing />
        <LpFaq />
        <LpFounder />
      </main>
      <LpFooter />
      <StickyCta />
    </div>
  )
}
