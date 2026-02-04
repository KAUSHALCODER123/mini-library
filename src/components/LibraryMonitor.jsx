import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Volume2, VolumeX, AlertTriangle, ShieldCheck } from 'lucide-react';

// Actual Supabase credentials provided by user
const supabaseUrl = "https://xhvsjrkwthgjhugtivlb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodnNqcmt3dGhnamh1Z3RpdmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxODcyNDcsImV4cCI6MjA4NTc2MzI0N30.IKTmKnwSvHv5_vVd7q8pMmnZywP3AZkjspDOKpSSkf4";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function LibraryMonitor() {
    const [isLoud, setIsLoud] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    useEffect(() => {
        // 1. Listen for new rows in 'noise_logs'
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'noise_logs' },
                (payload) => {
                    console.log('Noise alert received!', payload);
                    triggerAlert();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const triggerAlert = () => {
        setIsLoud(true);

        // Vibrate phone (300ms on, 100ms off, 300ms on)
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([300, 100, 300]);
        }

        // Play sound (ensure shhh.mp3 is in public folder)
        const audio = new Audio('/shhh.mp3');
        audio.play().catch(e => {
            console.log("Audio play blocked until user interacts");
        });

        // Reset after 3 seconds as per request
        setTimeout(() => setIsLoud(false), 3000);
    };

    const handleTestAlert = () => {
        setHasInteracted(true);
        triggerAlert();
    };

    return (
        <div className={`fixed inset-0 flex flex-col items-center justify-center transition-all duration-500 overflow-hidden ${isLoud ? 'bg-red-600 animate-pulse-fast' : 'bg-emerald-600'
            }`}>
            {/* Background patterns */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-black rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
            </div>

            <div className="relative z-10 text-white text-center p-8 max-w-md w-full">
                {isLoud ? (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <AlertTriangle className="w-32 h-32 text-white animate-bounce" />
                        </div>
                        <h1 className="text-8xl font-black tracking-tighter drop-shadow-2xl">
                            SHHHH!
                        </h1>
                        <p className="text-2xl font-bold uppercase tracking-widest opacity-90">
                            Silence Please
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="flex justify-center">
                            <div className="p-6 bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
                                <ShieldCheck className="w-24 h-24 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold mb-2 tracking-tight">QUIET MODE</h1>
                            <p className="text-xl opacity-80 font-medium">Please maintain silence</p>
                        </div>

                        <div className="flex items-center justify-center gap-3 py-4 px-6 bg-black/10 rounded-2xl backdrop-blur-md border border-white/5 animate-pulse">
                            <VolumeX className="w-5 h-5" />
                            <span className="text-sm font-semibold tracking-wider">MONITORING NOISE LEVELS</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer controls */}
            <div className="absolute bottom-12 flex flex-col items-center gap-4 w-full">
                <button
                    onClick={handleTestAlert}
                    className="group relative flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-bold backdrop-blur-md transition-all border border-white/20 active:scale-95"
                >
                    <Volume2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    TEST ALERT SYSTEM
                </button>

                {!hasInteracted && (
                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
                        Tap test button to enable audio
                    </p>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes pulse-fast {
          0%, 100% { background-color: rgb(220, 38, 38); }
          50% { background-color: rgb(153, 27, 27); }
        }
        .animate-pulse-fast {
          animation: pulse-fast 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}} />
        </div>
    );
}
