"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Copy, Check, ShoppingBag, Facebook, TreeDeciduous } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { Suspense } from "react";
// ... imports remain the same ...

function CreateListingContent() {
    // ... all existing component logic (hooks, state, etc.) ...
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session, status } = useSession();

    const [formData, setFormData] = useState({
        name: "",
        brand: "",
        category: "",
        condition: "",
        features: ""
    });
    const [result, setResult] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("ebay");

    useEffect(() => {
        // Protect Route
        if (status === "unauthenticated") {
            router.push("/login?callbackUrl=/create-listing");
            return;
        }

        // Pre-fill from URL params
        if (searchParams) {
            const name = searchParams.get("name");
            const brand = searchParams.get("brand");
            const category = searchParams.get("category");
            const condition = searchParams.get("condition");

            if (name || brand || category) {
                setFormData(prev => ({
                    ...prev,
                    name: name || "",
                    brand: brand || "",
                    category: category || "",
                    condition: condition || prev.condition
                }));
            }
        }
    }, [searchParams, status, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);

        try {
            const response = await fetch("/api/generate-listing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to generate listing");
            }

            setResult(data.data);
            toast.success("Listing generated successfully!");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    return (
        <div className="min-h-screen bg-background">
            <Navigation />
            <main className="container mx-auto px-4 py-24 md:py-32">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight">Create the Perfect Ad</h1>
                        <p className="text-lg text-muted-foreground">
                            Generate professional descriptions and titles for eBay and Facebook Marketplace in seconds.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        {/* Input Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Item Details</CardTitle>
                                <CardDescription>
                                    Enter the details of what you're selling.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Item Name *</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="e.g. Nike Air Max 90"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="brand">Brand</Label>
                                            <Input
                                                id="brand"
                                                name="brand"
                                                placeholder="e.g. Nike"
                                                value={formData.brand}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category</Label>
                                            <Input
                                                id="category"
                                                name="category"
                                                placeholder="e.g. Shoes"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="condition">Condition *</Label>
                                        <Input
                                            id="condition"
                                            name="condition"
                                            placeholder="e.g. Used - Good"
                                            value={formData.condition}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="features">Key Features / Notes</Label>
                                        <Textarea
                                            id="features"
                                            name="features"
                                            placeholder="e.g. Small scuff on toe, original box included"
                                            value={formData.features}
                                            onChange={handleInputChange}
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            "Generate Ad Content"
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Results / Help Section */}
                        <div>
                            {result ? (
                                <Card className="border-primary/20 bg-primary/5">
                                    <CardHeader>
                                        <CardTitle>Generated Content</CardTitle>
                                        <CardDescription>
                                            Review and copy your ad content below.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Tabs defaultValue="ebay" className="w-full" onValueChange={setActiveTab}>
                                            <TabsList className="grid w-full grid-cols-3">
                                                <TabsTrigger value="ebay">eBay</TabsTrigger>
                                                <TabsTrigger value="facebook">Facebook</TabsTrigger>
                                                <TabsTrigger value="gumtree">Gumtree</TabsTrigger>
                                            </TabsList>

                                            {/* eBay Content */}
                                            <TabsContent value="ebay" className="space-y-4 mt-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Title</Label>
                                                    <div className="flex gap-2">
                                                        <Input value={result.ebay.title} readOnly />
                                                        <Button size="icon" variant="outline" onClick={() => copyToClipboard(result.ebay.title)}>
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Description</Label>
                                                    <div className="relative">
                                                        <Textarea
                                                            value={result.ebay.description}
                                                            readOnly
                                                            className="min-h-[200px] pr-12"
                                                        />
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="absolute top-2 right-2"
                                                            onClick={() => copyToClipboard(result.ebay.description)}
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                                        💡 Pricing Tip: {result.ebay.pricing_tip}
                                                    </p>
                                                </div>
                                            </TabsContent>

                                            {/* Facebook Content */}
                                            <TabsContent value="facebook" className="space-y-4 mt-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Title</Label>
                                                    <div className="flex gap-2">
                                                        <Input value={result.facebook.title} readOnly />
                                                        <Button size="icon" variant="outline" onClick={() => copyToClipboard(result.facebook.title)}>
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Description</Label>
                                                    <div className="relative">
                                                        <Textarea
                                                            value={result.facebook.description}
                                                            readOnly
                                                            className="min-h-[200px] pr-12"
                                                        />
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="absolute top-2 right-2"
                                                            onClick={() => copyToClipboard(result.facebook.description)}
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                                        💡 Pricing Tip: {result.facebook.pricing_tip}
                                                    </p>
                                                </div>
                                            </TabsContent>

                                            {/* Gumtree Content */}
                                            <TabsContent value="gumtree" className="space-y-4 mt-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Title</Label>
                                                    <div className="flex gap-2">
                                                        <Input value={result.gumtree.title} readOnly />
                                                        <Button size="icon" variant="outline" onClick={() => copyToClipboard(result.gumtree.title)}>
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Description</Label>
                                                    <div className="relative">
                                                        <Textarea
                                                            value={result.gumtree.description}
                                                            readOnly
                                                            className="min-h-[200px] pr-12"
                                                        />
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="absolute top-2 right-2"
                                                            onClick={() => copyToClipboard(result.gumtree.description)}
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                                        💡 Pricing Tip: {result.gumtree.pricing_tip}
                                                    </p>
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center gap-2">
                                                <ShoppingBag className="w-5 h-5 text-blue-600" />
                                                <CardTitle className="text-lg">eBay Advertising Tips</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                                            <p>• <strong>Photos Matter:</strong> Use bright lighting and take photos from all angles (front, back, tags, defects).</p>
                                            <p>• <strong>Keywords:</strong> Include brand, model, size, and color in your title. Think "what would I search for?".</p>
                                            <p>• <strong>Be Honest:</strong> Clearly photograph and mention any flaws to avoid returns or disputes.</p>
                                            <p>• <strong>Pricing:</strong> Check "Sold Items" to see what similar items actually sold for, not just what they are listed for.</p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center gap-2">
                                                <Facebook className="w-5 h-5 text-blue-600" />
                                                <CardTitle className="text-lg">Facebook Marketplace Tips</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                                            <p>• <strong>Local Focus:</strong> Mention your pickup location (e.g., "Pickup in Downtown") to filter for serious local buyers.</p>
                                            <p>• <strong>Friendly Tone:</strong> Marketplace is social. Be polite and responsive to messages.</p>
                                            <p>• <strong>Safety First:</strong> Meet in public places during the day for exchanges.</p>
                                            <p>• <strong>Groups:</strong> Share your listing to local "Buy & Sell" groups for more exposure.</p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center gap-2">
                                                <TreeDeciduous className="w-5 h-5 text-green-600" />
                                                <CardTitle className="text-lg">Gumtree Tips</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                                            <p>• <strong>Location:</strong> Use "My Location" feature or specify suburb clearly.</p>
                                            <p>• <strong>Negotiation:</strong> Expect haggling. Price slightly higher to allow room for negotiation.</p>
                                            <p>• <strong>Communication:</strong> Reply fast via the app. Many users lose interest quickly.</p>
                                            <p>• <strong>Refresh:</strong> If it doesn't sell in a week, delete and repost to get back to the top.</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function CreateListingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
            <CreateListingContent />
        </Suspense>
    );
}
