import { dodopayments } from "@/lib/dodopayments";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log('Fetching products from Dodo Payments');
    const products = await dodopayments.products.list();
    
    console.log(`Fetched ${products.items.length} products`);
    
    if (!products.items || products.items.length === 0) {
      return NextResponse.json(
        { message: "No products found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(products.items);
  } catch (error) {
    console.error('Error fetching products:', error);
    
    // More detailed error response
    return NextResponse.json(
      { 
        error: "Failed to fetch products", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}