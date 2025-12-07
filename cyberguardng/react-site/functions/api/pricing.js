// Dynamic Pricing Calculator API
// GET /api/pricing?service=soc2&size=startup&factors=cloud_first

export async function onRequestGet(context) {
  try {
    const { DB } = context;
    const url = new URL(context.request.url);
    
    const serviceType = url.searchParams.get('service'); // e.g., 'soc2_type1', 'iso27001'
    const companySize = url.searchParams.get('size'); // e.g., 'startup', 'small', 'medium'
    const factorsParam = url.searchParams.get('factors'); // comma-separated
    
    if (!serviceType || !companySize) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameters: service and size" 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get base pricing
    const pricingTier = await DB.prepare(`
      SELECT * FROM pricing_tiers 
      WHERE service_type = ? AND company_size = ?
    `).bind(serviceType, companySize).first();

    if (!pricingTier) {
      return new Response(
        JSON.stringify({ 
          error: "Pricing not found for this service and company size" 
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    let basePrice = pricingTier.base_price;
    let totalPrice = basePrice;
    const appliedFactors = [];
    const priceFactors = JSON.parse(pricingTier.price_factors || '{}');

    // Apply pricing factors
    if (factorsParam) {
      const requestedFactors = factorsParam.split(',');
      
      for (const factor of requestedFactors) {
        if (priceFactors[factor] !== undefined) {
          const adjustment = priceFactors[factor];
          totalPrice += adjustment;
          appliedFactors.push({
            name: factor,
            adjustment,
            description: getFactorDescription(factor)
          });
        }
      }
    }

    // Calculate ranges (±15%)
    const minPrice = Math.round(totalPrice * 0.85);
    const maxPrice = Math.round(totalPrice * 1.15);

    return new Response(
      JSON.stringify({
        service: serviceType,
        companySize,
        basePrice,
        totalPrice: Math.round(totalPrice),
        priceRange: {
          min: minPrice,
          max: maxPrice
        },
        appliedFactors,
        availableFactors: Object.keys(priceFactors),
        disclaimer: "Final pricing depends on specific requirements. Schedule a consultation for an accurate quote.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Pricing API error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Helper: Get human-readable factor descriptions
function getFactorDescription(factor) {
  const descriptions = {
    'employees_under_50': 'Small team (under 50 employees)',
    'employees_50_200': 'Medium team (50-200 employees)',
    'employees_200_1000': 'Large team (200-1000 employees)',
    'cloud_first': 'Cloud-first infrastructure (discount)',
    'complex_systems': 'Complex system architecture',
    'multi_region': 'Multi-region deployment',
    'legacy_systems': 'Legacy system integration',
    'complex_integrations': 'Complex third-party integrations',
    'includes_type1': 'Includes Type I audit',
    'quarterly_reviews': 'Quarterly compliance reviews',
    'international': 'International operations',
    'apps_1_3': 'Testing 1-3 applications',
    'critical_app': 'Critical/high-risk application',
    'api_testing': 'API security testing',
  };
  
  return descriptions[factor] || factor.replace(/_/g, ' ');
}

// POST /api/pricing - Add or update pricing tier (admin only)
export async function onRequestPost(context) {
  try {
    const { DB } = context;
    const body = await context.request.json();
    
    const { serviceType, companySize, basePrice, priceFactors } = body;

    if (!serviceType || !companySize || !basePrice) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await DB.prepare(`
      INSERT INTO pricing_tiers (service_type, company_size, base_price, price_factors)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(service_type, company_size) DO UPDATE SET
        base_price = excluded.base_price,
        price_factors = excluded.price_factors,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      serviceType,
      companySize,
      basePrice,
      JSON.stringify(priceFactors || {})
    ).run();

    return new Response(
      JSON.stringify({ success: true, message: "Pricing tier saved" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Save pricing error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
