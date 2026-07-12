import React, { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorState } from "../../components/ErrorState";
import {
  getRewards,
  redeemReward,
  getRewardRedemptions,
  createReward,
  updateReward,
} from "../../lib/db/rewards";
import { Reward, RewardRedemption } from "../../lib/types";
import { toast } from "react-hot-toast";
import { ShoppingBag, Sparkles, Plus, X, Package, Ticket } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export const RewardsPage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  // Modal State for Admin
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pointsRequired, setPointsRequired] = useState(100);
  const [stock, setStock] = useState(5);

  const isAdmin = profile?.role === "admin";
  const pointsBalance = profile?.points_balance || 0;

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [rewardsData, redData] = await Promise.all([
        getRewards(),
        isAdmin
          ? getRewardRedemptions() // Admin sees all
          : profile
            ? getRewardRedemptions(profile.id) // Employee sees own
            : Promise.resolve([]),
      ]);

      setRewards(rewardsData.filter((r) => r.status === "active"));
      setRedemptions(redData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load rewards store catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  const handleRedeem = async (reward: Reward) => {
    if (!profile) return;

    // Invariant #2: Block client side
    if (pointsBalance < reward.points_required) {
      toast.error("Insufficient points balance.");
      return;
    }
    if (reward.stock <= 0) {
      toast.error("This reward is out of stock.");
      return;
    }

    if (
      !window.confirm(
        `Redeem "${reward.name}" for ${reward.points_required} points?`,
      )
    ) {
      return;
    }

    try {
      setRedeemingId(reward.id);

      // Call atomic RPC redemption wrapper (Invariant #2)
      const result = await redeemReward(profile.id, reward.id);

      if (result.success) {
        toast.success(
          `Successfully redeemed ${reward.name}! Claim instructions sent to your email.`,
        );
        // Refresh auth profile (to update points balance on Topbar)
        await refreshProfile();
        loadData();
      } else {
        toast.error(result.error || "Failed to redeem reward.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error executing redemption.");
    } finally {
      setRedeemingId(null);
    }
  };

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || pointsRequired <= 0 || stock < 0) {
      toast.error("Please enter all required fields.");
      return;
    }

    const payload = {
      name,
      description,
      points_required: Number(pointsRequired),
      stock: Number(stock),
      status: "active" as any,
    };

    try {
      await createReward(payload);
      toast.success("Reward added to store catalog!");
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to add reward.");
    }
  };

  if (loading) return <LoadingSpinner message="Opening Eco Store..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-black text-text-primary m-0 tracking-tight flex items-center space-x-2">
            <span className="text-[#6741d9]">
              <ShoppingBag className="h-6 w-6" />
            </span>
            <span>Eco Rewards Store</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Redeem your earned points balance for eco-friendly corporate
            rewards.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-[#6741d9] hover:bg-[#522eb0] text-white font-bold py-2.5 px-4 rounded-lg shadow-sm active:scale-95 transition-all text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Store Item</span>
          </button>
        )}
      </div>

      {/* Rewards Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {rewards.map((r) => {
          const isOutOfStock = r.stock <= 0;
          const isInsufficientPoints = pointsBalance < r.points_required;
          const cannotRedeem = isOutOfStock || isInsufficientPoints;

          return (
            <div key={r.id} className="flex flex-col h-full relative">
              <Card
                accent={isOutOfStock ? undefined : "secondary"}
                className={`flex-grow flex flex-col justify-between text-left ${
                  isOutOfStock ? "opacity-60 bg-surface/50 border-dashed" : ""
                }`}
              >
                <div className="space-y-3">
                  {/* Stock Tag */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                        isOutOfStock
                          ? "bg-danger/10 text-danger border-danger/10"
                          : "bg-primary/10 text-primary border-primary/10"
                      }`}
                    >
                      <Package className="h-2.5 w-2.5 mr-0.5" />
                      <span>
                        {isOutOfStock ? "Out of Stock" : `${r.stock} In Stock`}
                      </span>
                    </span>

                    <span className="text-xs font-black text-[#6741d9] flex items-center space-x-0.5 bg-[#6741d9]/5 px-2 py-0.5 rounded-lg border border-[#6741d9]/10">
                      <span>{r.points_required}</span>
                      <Sparkles className="h-3 w-3 fill-[#6741d9]/25 text-[#6741d9]" />
                    </span>
                  </div>

                  {/* Body details */}
                  <div className="space-y-1">
                    <h3
                      className="text-sm font-extrabold text-text-primary m-0 truncate"
                      title={r.name}
                    >
                      {r.name}
                    </h3>
                    <p className="text-xs text-text-secondary/80 line-clamp-3 leading-relaxed mt-2">
                      {r.description}
                    </p>
                  </div>
                </div>

                {/* Redeem Action */}
                <div className="mt-6 pt-4 border-t border-border/40">
                  <button
                    onClick={() => handleRedeem(r)}
                    disabled={cannotRedeem || redeemingId === r.id || isAdmin}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-bold text-center border transition-all active:scale-[0.98] ${
                      isOutOfStock
                        ? "bg-surface text-text-secondary/40 border-border cursor-not-allowed"
                        : isInsufficientPoints
                          ? "bg-surface text-text-secondary/50 border-border cursor-not-allowed hover:bg-danger/5 hover:text-danger hover:border-danger/10"
                          : isAdmin
                            ? "bg-surface text-text-secondary/40 border-border cursor-not-allowed"
                            : "bg-[#6741d9] hover:bg-[#522eb0] text-white border-transparent shadow-sm"
                    }`}
                  >
                    {redeemingId === r.id
                      ? "Processing..."
                      : isOutOfStock
                        ? "Sold Out"
                        : isInsufficientPoints
                          ? "Not Enough Points"
                          : isAdmin
                            ? "Admin View Only"
                            : "Redeem Reward"}
                  </button>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Redemptions Audit List */}
      <Card
        title={isAdmin ? "All Corporate Redemptions" : "Your Redemptions"}
        subtitle="A record of voucher claims."
      >
        {redemptions.length === 0 ? (
          <div className="text-center py-6 text-xs text-text-secondary/50">
            No redemptions found.
          </div>
        ) : (
          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-border text-text-secondary font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Claim Date</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4 text-right">Points Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {redemptions.map((red) => (
                  <tr
                    key={red.id}
                    className="hover:bg-surface/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-text-primary">
                      {new Date(red.redeemed_at).toLocaleDateString()}{" "}
                      {new Date(red.redeemed_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-text-primary">
                      {red.user_name}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-text-primary flex items-center space-x-1">
                      <Ticket className="h-3.5 w-3.5 text-text-secondary/60" />
                      <span>{red.reward_name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-[#6741d9]">
                      -{red.reward_points_required}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-base border border-border rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">
                Add Reward Catalog Item
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-surface transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleCreateReward}
              className="p-5 space-y-4 text-left"
            >
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Reward Item Name*
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eco Swag Kit"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-[#6741d9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Voucher Claim Description*
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Specify details, contents, or claim instruction steps..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-[#6741d9] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Points Required*
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={pointsRequired}
                    onChange={(e) => setPointsRequired(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Initial Stock Count*
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-border flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-bold text-text-secondary bg-base hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#6741d9] hover:bg-[#522eb0] text-white border border-transparent rounded-lg text-xs font-bold shadow-md shadow-warning/10 transition-colors"
                >
                  Publish Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
