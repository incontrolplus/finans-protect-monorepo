"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, LayoutDashboard } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden bg-black text-white">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-neutral-900/50 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full h-16 border-b border-white/10 bg-black/50 backdrop-blur-md z-50 flex items-center justify-between px-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white to-neutral-400 flex items-center justify-center text-black font-bold text-xl">
            O
          </div>
          <span className="font-semibold text-xl tracking-tight">OpenBalancer</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Documentation</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
          <a href="#" className="hover:text-white transition-colors">Blog</a>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-neutral-300 hover:text-white hidden md:inline-flex">
            Sign In
          </Button>
          <Button className="rounded-full bg-white text-black hover:bg-neutral-200">
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-6xl px-6 pt-40 pb-20 flex flex-col items-center text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-neutral-300 mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          OpenBalancer 2.0 is now live
          <ChevronRight className="w-4 h-4 ml-1 text-neutral-500" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500"
        >
          Balance your traffic.
          <br />
          Without the complexity.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-10"
        >
          The next-generation load balancer that automatically scales, routes, and secures your applications globally. Built for the modern edge.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-24"
        >
          <Button size="lg" className="h-12 px-8 rounded-full bg-white text-black hover:bg-neutral-200 text-base font-medium">
            Start Deploying
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 rounded-full border-white/20 hover:bg-white/5 text-base font-medium">
            <LayoutDashboard className="w-4 h-4 mr-2 text-neutral-400" />
            View Dashboard
          </Button>
        </motion.div>

        {/* 3D Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 100, rotateX: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, type: "spring", bounce: 0.3 }}
          style={{ perspective: "1000px" }}
          className="w-full relative"
        >
          <div className="relative w-full aspect-video rounded-xl border border-white/10 bg-neutral-900/50 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/5">
            {/* Window Controls */}
            <div className="absolute top-0 left-0 w-full h-12 border-b border-white/10 flex items-center px-4 gap-2 bg-black/20 z-20">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>

            {/* Topology Canvas */}
            <div className="absolute inset-0 pt-12">
              <TopologyCanvas />
            </div>
            
            {/* Dashboard Overlay UI (Glassmorphism) */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-20 pointer-events-none">
              <div className="p-4 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md">
                <div className="text-sm text-neutral-400 mb-1">Global Requests</div>
                <div className="text-2xl font-bold">2.4M <span className="text-sm text-green-500 font-medium">+12%</span></div>
              </div>
              <div className="p-4 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md">
                <div className="text-sm text-neutral-400 mb-1">Active Nodes</div>
                <div className="text-2xl font-bold text-right">48 <span className="text-sm text-neutral-500 font-medium">/ 50</span></div>
              </div>
            </div>
          </div>
          
          {/* Mockup reflection/glow */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-[100px] bg-gradient-to-t from-primary/30 to-transparent blur-[50px] -z-10" />
        </motion.div>
      </main>
    </div>
  );
}

// Topology Canvas component preserving the "live topology visualization logic"
function TopologyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width;
    let height = canvas.height;

    // Handle resize
    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // Node representation
    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      isCenter?: boolean;
    }

    const nodes: Node[] = [];
    const numNodes = 30;

    // Add center node
    nodes.push({
      x: width / 2,
      y: height / 2,
      vx: 0,
      vy: 0,
      radius: 12,
      isCenter: true,
    });

    // Add surrounding nodes
    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 3 + 2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 200) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            
            // Connection opacity based on distance
            const opacity = 1 - dist / 200;
            
            if (nodes[i].isCenter || nodes[j].isCenter) {
              ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
              ctx.lineWidth = 1.5;
            } else {
              ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.15})`;
              ctx.lineWidth = 0.5;
            }
            
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Move nodes
        if (!node.isCenter) {
          node.x += node.vx;
          node.y += node.vy;

          // Bounce off walls
          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;
          
          // Slight attraction to center
          const dxCenter = (width / 2) - node.x;
          const dyCenter = (height / 2) - node.y;
          node.vx += dxCenter * 0.00005;
          node.vy += dyCenter * 0.00005;
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        
        if (node.isCenter) {
          ctx.fillStyle = "rgba(255, 255, 255, 1)";
          ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
          ctx.shadowBlur = 15;
        } else {
          ctx.fillStyle = "rgba(200, 200, 200, 0.8)";
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block bg-transparent"
    />
  );
}
