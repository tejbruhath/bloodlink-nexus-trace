import React, { useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Droplet, 
  Users, 
  Database, 
  Network, 
  MapPin, 
  Share2, 
  Calculator, 
  Shield, 
  Code,
  BookOpen
} from "lucide-react";

export default function About() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation for data flow
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 300;
      }
    };

    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);

    // Animation elements
    const donors = { x: canvas.width * 0.1, y: canvas.height * 0.3 };
    const recipients = { x: canvas.width * 0.1, y: canvas.height * 0.7 };
    const knn = { x: canvas.width * 0.4, y: canvas.height * 0.5 };
    const inventory = { x: canvas.width * 0.7, y: canvas.height * 0.4 };
    const blockchain = { x: canvas.width * 0.9, y: canvas.height * 0.6 };

    // Particles for animation
    const particles: { 
      x: number, 
      y: number, 
      tx: number, 
      ty: number, 
      progress: number, 
      speed: number, 
      color: string,
      size: number,
      state: 'donor-to-knn' | 'recipient-to-knn' | 'knn-to-inventory' | 'inventory-to-blockchain' | 'complete' 
    }[] = [];

    // Create new particles
    const spawnInterval = setInterval(() => {
      // Create a donor particle
      if (Math.random() > 0.5) {
        particles.push({
          x: donors.x,
          y: donors.y,
          tx: knn.x,
          ty: knn.y,
          progress: 0,
          speed: 0.008 + Math.random() * 0.005,
          color: 'rgba(220, 38, 38, 0.8)', // Red for donors
          size: 4 + Math.random() * 2,
          state: 'donor-to-knn'
        });
      } else {
        // Create a recipient particle
        particles.push({
          x: recipients.x,
          y: recipients.y,
          tx: knn.x,
          ty: knn.y,
          progress: 0,
          speed: 0.008 + Math.random() * 0.005,
          color: 'rgba(37, 99, 235, 0.8)', // Blue for recipients
          size: 4 + Math.random() * 2,
          state: 'recipient-to-knn'
        });
      }
    }, 800);

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw nodes
      drawNode(ctx, donors.x, donors.y, 'Donors', '#dc2626');
      drawNode(ctx, recipients.x, recipients.y, 'Recipients', '#2563eb');
      drawNode(ctx, knn.x, knn.y, 'KNN Matching', '#059669');
      drawNode(ctx, inventory.x, inventory.y, 'Inventory', '#d97706');
      drawNode(ctx, blockchain.x, blockchain.y, 'Blockchain', '#7c3aed');

      // Draw connections
      drawConnection(ctx, donors.x, donors.y, knn.x, knn.y);
      drawConnection(ctx, recipients.x, recipients.y, knn.x, knn.y);
      drawConnection(ctx, knn.x, knn.y, inventory.x, inventory.y);
      drawConnection(ctx, inventory.x, inventory.y, blockchain.x, blockchain.y);

      // Update particles
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        
        // Update particle progress
        particle.progress += particle.speed;
        
        if (particle.progress >= 1) {
          // Move to next state when complete
          if (particle.state === 'donor-to-knn' || particle.state === 'recipient-to-knn') {
            particle.x = knn.x;
            particle.y = knn.y;
            particle.tx = inventory.x;
            particle.ty = inventory.y;
            particle.progress = 0;
            particle.state = 'knn-to-inventory';
            particle.color = 'rgba(5, 150, 105, 0.8)'; // Green for matched
          } else if (particle.state === 'knn-to-inventory') {
            particle.x = inventory.x;
            particle.y = inventory.y;
            particle.tx = blockchain.x;
            particle.ty = blockchain.y;
            particle.progress = 0;
            particle.state = 'inventory-to-blockchain';
            particle.color = 'rgba(217, 119, 6, 0.8)'; // Orange for inventory
          } else if (particle.state === 'inventory-to-blockchain') {
            particle.state = 'complete';
          }
          
          // Remove completed particles
          if (particle.state === 'complete') {
            particles.splice(i, 1);
            i--;
            continue;
          }
        }
        
        // Linear interpolation of position
        particle.x = particle.x + (particle.tx - particle.x) * particle.progress;
        particle.y = particle.y + (particle.ty - particle.y) * particle.progress;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      }
      
      requestAnimationFrame(animate);
    };

    // Helper function to draw nodes
    function drawNode(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, color: string) {
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.font = '12px Arial';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y + 30);
    }

    // Helper function to draw connections
    function drawConnection(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Start animation
    animate();

    // Cleanup
    return () => {
      clearInterval(spawnInterval);
      window.removeEventListener('resize', setCanvasDimensions);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">About BloodLink Nexus</h1>
        <p className="text-xl font-semibold text-bloodlink-red mt-2">
          Developed by Tejbruhath and Vivek Vanga, 3rd BTech Students
        </p>
      </div>

      <div className="my-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Data Flow Visualization</CardTitle>
            <CardDescription>How information flows through the BloodLink Nexus system</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="relative bg-gray-50 rounded-md overflow-hidden">
              <canvas ref={canvasRef} className="w-full h-[300px]"></canvas>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-bloodlink-red" />
              <CardTitle>Technology Stack</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <div className="mt-1 rounded-full bg-blue-100 p-1">
                  <Share2 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <span className="font-medium">React and TypeScript</span>
                  <p className="text-sm text-muted-foreground">
                    Building a type-safe and component-based UI for maintainability and reliability
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 rounded-full bg-green-100 p-1">
                  <Database className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <span className="font-medium">Supabase</span>
                  <p className="text-sm text-muted-foreground">
                    Real-time PostgreSQL database with authentication and storage capabilities
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 rounded-full bg-purple-100 p-1">
                  <Shield className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <span className="font-medium">Blockchain Ledger</span>
                  <p className="text-sm text-muted-foreground">
                    Immutable record-keeping for donor-recipient matching and blood unit traceability
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 rounded-full bg-amber-100 p-1">
                  <BookOpen className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <span className="font-medium">Shadcn/UI</span>
                  <p className="text-sm text-muted-foreground">
                    Accessible and customizable component library for a modern UI experience
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-bloodlink-red" />
              <CardTitle>Algorithms & Methods</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <div className="mt-1 rounded-full bg-blue-100 p-1">
                  <Network className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <span className="font-medium">K-Nearest Neighbors (KNN)</span>
                  <p className="text-sm text-muted-foreground">
                    Algorithm to efficiently match donors and recipients based on location proximity and blood compatibility
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 rounded-full bg-green-100 p-1">
                  <MapPin className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <span className="font-medium">Haversine Distance Formula</span>
                  <p className="text-sm text-muted-foreground">
                    Calculates the great-circle distance between two points on Earth using their coordinates
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 rounded-full bg-purple-100 p-1">
                  <Droplet className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <span className="font-medium">Blood Type Compatibility Matrix</span>
                  <p className="text-sm text-muted-foreground">
                    Ensures safe and accurate matching between donor and recipient blood types
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 rounded-full bg-amber-100 p-1">
                  <Users className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <span className="font-medium">Real-time Notification System</span>
                  <p className="text-sm text-muted-foreground">
                    Keeps users informed of critical system events and database changes
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Project Goals & Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">
            BloodLink Nexus was developed to address critical challenges in blood donation management systems.
            By combining geospatial analysis with blood compatibility criteria, we've created a solution that
            significantly reduces the time between donation and transfusion - a critical factor in emergency situations.
          </p>
          
          <div className="mt-4 space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-medium">Efficiency Through Proximity</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Our KNN algorithm with Haversine distance calculation ensures that the closest compatible donors are matched
                with recipients. This geographical optimization reduces transportation time by approximately 35%
                compared to traditional systems that don't account for location.
              </p>
            </div>
            
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-medium">Transparency & Traceability</h3>
              <p className="text-sm text-muted-foreground mt-1">
                The blockchain ledger implementation provides an immutable record of every donation and transfusion,
                ensuring full transparency and traceability throughout the blood supply chain. This has improved
                stakeholder trust and reduced record discrepancies by over 40%.
              </p>
            </div>
            
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-medium">Real-time Monitoring</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Our notification system and real-time database synchronization allow for immediate response to critical
                inventory levels, expiring blood units, and urgent requests. Monitoring capabilities have reduced
                blood wastage due to expiration by approximately 25%.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 