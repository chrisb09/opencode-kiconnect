import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Patch

# Set font family
plt.rcParams["font.sans-serif"] = ["DejaVu Sans", "Arial", "Helvetica", "sans-serif"]
plt.rcParams["font.family"] = "sans-serif"

# Exact canvas size matching original (1600 x 756 at 100 dpi)
fig = plt.figure(figsize=(16, 7.56), dpi=100)
ax = fig.add_subplot(111)

# Models and scores (excluding discontinued Devstral-Small-2-24B)
models_g1 = [
    "Qwen3.8-27B",
    "gpt-oss-120B",
    "Mistral-Small-4-119B",
    "Mistral-Small-3.2-24B",
    "Apertus-70B",
]
models_g2 = [
    "gpt-5.5",
    "gpt-5.4-mini",
]
models_g3 = [
    "Claude Opus 4.6",
    "Gemini 3.8 Flash",
    "DeepSeek V4.1 Flash",
]

all_models = models_g1 + models_g2 + models_g3
n_models = len(all_models)

scores = {
    "Qwen3.8-27B": (89.2, 88.5, 61.7, 79.5),
    "gpt-oss-120B": (78.2, 90.0, 63.5, 69.0),
    "Mistral-Small-4-119B": (71.0, 86.2, 65.0, 74.0),
    "Mistral-Small-3.2-24B": (46.1, 81.0, 38.0, 65.3),
    "Apertus-70B": (27.2, 76.5, 18.0, 25.9),
    "gpt-5.5": (96.5, 94.0, 88.2, 91.0),
    "gpt-5.4-mini": (91.8, 89.8, 81.5, 85.5),
    "Claude Opus 4.6": (91.3, 91.2, 80.8, 84.5),
    "Gemini 3.8 Flash": (95.3, 92.0, 73.7, 85.0),
    "DeepSeek V4.1 Flash": (90.9, 89.4, 74.2, 82.0),
}

colors = ["#1d4ed8", "#16a34a", "#ea580c", "#6d28d9"]
bar_width = 0.19
x_indices = np.arange(n_models)

# Draw bars
for i, m in enumerate(all_models):
    m_scores = scores[m]
    if i < len(models_g1):
        hatch = ""
        edgecolor = "none"
        linewidth = 0
    elif i < len(models_g1) + len(models_g2):
        hatch = "..."
        edgecolor = "#1e293b"
        linewidth = 0.5
    else:
        hatch = "//"
        edgecolor = "#1e293b"
        linewidth = 0.5
    
    for b_idx in range(4):
        x = x_indices[i] + (b_idx - 1.5) * bar_width
        val = m_scores[b_idx]
        ax.bar(
            x, val, width=bar_width,
            color=colors[b_idx],
            hatch=hatch,
            edgecolor=edgecolor,
            linewidth=linewidth,
            zorder=3
        )
        # Value label on top of bar rotated 90 degrees
        ax.text(
            x, val + 1.2, f"{val:.1f}%",
            ha="center", va="bottom",
            rotation=90, fontsize=6.8,
            fontweight="normal", color="#1e293b",
            zorder=4
        )

# X axis formatting
ax.set_xticks(x_indices)
ax.set_xticklabels(all_models, rotation=25, ha="right", fontsize=9.2)
ax.set_xlim(-0.7, n_models - 0.3)
ax.set_ylim(0, 120)
ax.set_ylabel("Benchmark Score (%)", fontsize=10.5, labelpad=8)
ax.set_title("RWTH Ecosystem: Self-Hosted Models vs. Free KIConnect and Paid External APIs", fontsize=12.5, pad=14)

# Horizontal grid
ax.grid(axis="y", linestyle="--", alpha=0.6, color="#cbd5e1", zorder=1)
ax.set_yticks([0, 20, 40, 60, 80, 100, 120])

# Group dividers
div1 = len(models_g1) - 0.5
div2 = len(models_g1) + len(models_g2) - 0.5

ax.axvline(div1, color="#334155", linestyle="-", linewidth=1.2, zorder=2)
ax.axvline(div2, color="#94a3b8", linestyle="--", linewidth=1.0, zorder=2)

# Section Badges at the top
bbox_g1 = dict(boxstyle="round,pad=0.45,rounding_size=0.3", fc="#f8fafc", ec="#94a3b8", lw=1.2)
ax.text(
    (div1 - 0.5) / 2, 107.5,
    "1. RWTH Self-Hosted HPC Cluster",
    ha="center", va="center", fontsize=10.5,
    bbox=bbox_g1, zorder=5
)

bbox_g2 = dict(boxstyle="round,pad=0.45,rounding_size=0.3", fc="#f0fdf4", ec="#16a34a", lw=1.2)
ax.text(
    div1 + (div2 - div1) / 2, 107.5,
    "2. KIConnect (Free External APIs)",
    ha="center", va="center", fontsize=10.5,
    bbox=bbox_g2, zorder=5
)

bbox_g3 = dict(boxstyle="round,pad=0.45,rounding_size=0.3", fc="#fffbeb", ec="#d97706", lw=1.2)
ax.text(
    div2 + (n_models - 0.5 - div2) / 2, 107.5,
    "3. External Paid Frontier APIs",
    ha="center", va="center", fontsize=10.5,
    bbox=bbox_g3, zorder=5
)

# Custom Legend matching original structure
custom_order = [
    Patch(facecolor=colors[0], label="GPQA Diamond (Reasoning)"),
    Patch(facecolor=colors[3], label="IFBench (Instruction Following)"),
    Patch(facecolor="#f8fafc", edgecolor="#475569", hatch="...", label="[Dotted Bars] KIConnect (Externally Hosted, FREE)"),
    Patch(facecolor=colors[1], label="MMLU (Knowledge)"),
    Patch(facecolor="none", edgecolor="none", label="Deployment Access:"),
    Patch(facecolor="#f8fafc", edgecolor="#475569", hatch="//", label="[Hatched Bars] External Paid APIs (Reference)"),
    Patch(facecolor=colors[2], label="SWE-bench Verified / Coding"),
    Patch(facecolor="#f8fafc", edgecolor="#94a3b8", label="[Solid Bars] RWTH Cluster (Self-Hosted)"),
]

# Adjust subplots to reserve lower area for rotated labels and legend
fig.subplots_adjust(left=0.048, right=0.985, top=0.93, bottom=0.27)

fig.legend(
    handles=custom_order,
    loc="lower left",
    bbox_to_anchor=(0.048, 0.035),
    ncol=3,
    fontsize=8.5,
    frameon=True,
    fancybox=True,
    edgecolor="#cbd5e1",
    facecolor="#f8fafc",
    framealpha=0.95,
    handletextpad=0.8,
    columnspacing=1.8
)

plt.savefig("assets/benchmarks.png", dpi=100)
print("Updated benchmarks.png saved successfully!")
