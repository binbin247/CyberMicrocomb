# Stokes soliton

[English](./stokes-soliton.en.md)

## 仿真的方程

这是 Primary 场 $P(\phi,t)$ 与 Stokes 场 $S(\phi,t)$ 的双场归一化 coupled LLE。Primary
场被外部泵浦驱动，Stokes 场由噪声 seed 通过 Raman gain 增长。频域线性项为

$$
\left.\frac{\partial \hat P_\mu}{\partial t}\right|_{\mathrm{lin}}
=
\left(-1-i\alpha_P-id_{2P}\mu^2\right)\hat P_\mu,
$$

$$
\left.\frac{\partial \hat S_\mu}{\partial t}\right|_{\mathrm{lin}}
=
\left(-1-i\alpha_S-id_{2S}\mu^2-i\delta\mu\right)\hat S_\mu.
$$

当前界面中 $\alpha_S=0$ 固定，不作为可调参数。上述线性项是求解器实际使用的频域形式。
按 $\partial_\phi\to i\mu$ 的 Fourier 约定，
它们在时域中等价于

$$
\left.\frac{\partial P}{\partial t}\right|_{\mathrm{lin}}
=-(1+i\alpha_P)P+i d_{2P}\frac{\partial^2 P}{\partial\phi^2},
$$

$$
\left.\frac{\partial S}{\partial t}\right|_{\mathrm{lin}}
=-(1+i\alpha_S)S+i d_{2S}\frac{\partial^2 S}{\partial\phi^2}
-\delta\frac{\partial S}{\partial\phi}.
$$

时域非线性系数为

$$
N_P =
i|P|^2
-i\tau_R\left(\partial_\phi |P|^2+\eta\partial_\phi |S|^2\right)
+\eta\left[i(2-f_R)-\frac{g_P}{2}\right]|S|^2,
$$

$$
N_S =
ir_w|S|^2
-ir_w\tau_R\left(\eta\partial_\phi |P|^2+\partial_\phi |S|^2\right)
+\eta r_w\left[i(2-f_R)+\frac{g_S}{2}\right]|P|^2.
$$

也就是说，非线性更新近似为
$\partial_t P|_{\mathrm{nl}}=N_P P+F$，
$\partial_t S|_{\mathrm{nl}}=N_S S+\xi$。这里 $\eta$ 是 mode overlap，$f_R$
是 Raman 分数，$g_P$ 是 Primary Raman loss，$g_S$ 是 Stokes Raman gain，
$r_w$ 是 wavelength ratio，$\delta$ 是 FSR mismatch，$\xi$ 是弱复噪声 seed。

## 物理图像

Stokes soliton 不是把 Primary soliton 复制一遍，而是 Raman 过程产生的第二个孤子场。
Primary soliton 先形成强局域光场；这个局域光场为 Stokes 模式族提供 Raman gain，并通过交叉相位
调制和群速匹配把 Stokes pulse 俘获在相近的时间位置。

四张图可以这样读：

- `Temporal field`：比较 Primary 和 Stokes 的时域强度，Stokes 通常更弱且由噪声增长。
- `Comb spectrum`：比较两个模式族的谱宽、谱峰和相对强度。
- `Intracavity energy`：看 Primary 能量是否先建立，Stokes 能量是否随后增长并稳定。
- `Temporal evolution`：左右两图分别显示 Primary 与 Stokes 的演化，用来判断俘获、漂移或失稳。

Stokes 场的强度和稳定性由 Raman gain/loss、overlap、FSR mismatch、Stokes dispersion 和
wavelength ratio 共同决定。默认 preset 的设计目标是：主要扫描 `Pump detuning`，即可观察
Primary soliton 建立以及 Stokes soliton 从噪声中增长的过程。

## Demo

1. 在 `MODEL` 中选择 `Stokes soliton`。
2. 保持默认值：`grid = 1024`, `Pump detuning = 39.1`,
   `Pump power = 12.247`, `Primary D2 = 0.02`, `Stokes D2 = 0.02`,
   `FSR mismatch = 0`, `Overlap = 0.5`, `fR = 0.18`,
   `Primary Raman loss = 0.126`, `Stokes Raman gain = 0.126`,
   `Wavelength ratio = 1550/1630`, `tauR = 0.00033`,
   `Noise seed = 0.00001`, `stepsPerFrame = 1000`。
3. 点击 `Play`，先看 Primary 是否形成局域脉冲。
4. 继续运行，观察 Stokes 是否从噪声背景中增长并被时间俘获。
5. 主要扫描 `Pump detuning`，寻找 Primary-only、Stokes-growth 和双孤子稳定区。
6. 如果 Stokes 始终很弱，先延长运行时间；再小幅增加 `Stokes Raman gain` 或 `Overlap`。

如果仿真变慢，优先降低 `stepsPerFrame` 或网格点数。该模型用于交互式理解 Stokes soliton
机制，不包含热动力学、真实材料单位换算或完整多模族耦合。

## 参考文献

- Q.-F. Yang, X. Yi, K. Y. Yang, and K. Vahala, "Stokes solitons in optical microcavities," *Nature Physics* **13**, 53-57 (2017). <https://doi.org/10.1038/nphys3875>
- Supplementary information for "Stokes solitons in optical microcavities," *Nature Physics* (2017).
- 本实现的默认 Stokes 参数沿用开发时参考的 MATLAB 脚本 `Ramansoliton_scan.m` 和 `Ramansoliton_splitstep.m` 中的归一化设定。
