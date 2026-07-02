# Stokes soliton

[English](./stokes-soliton.en.md)

## 仿真的方程

该模型使用 Primary 场 $P(\phi,t)$ 和 Stokes 场 $S(\phi,t)$ 的双场归一化
coupled LLE。线性项在频域中更新：

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

当前界面中 $\alpha_S=0$ 固定，不作为用户可调参数。非线性和 Raman 耦合在时域中更新：

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

其中 $\eta$ 是 mode overlap，$f_R$ 是 Raman 分数，$g_P$ 是 Primary
Raman loss，$g_S$ 是 Stokes Raman gain，$r_w$ 是 wavelength ratio。
Primary 场额外受到外部泵浦 $F$ 驱动；Stokes 场由弱复噪声 seed 和 Raman gain
放大。

## 物理图像

Stokes soliton 是由 Primary soliton 通过 Raman 过程驱动出来的第二个孤子场。
Primary soliton 先在泵浦模式族中形成强局域光场；这个局域光场为 Stokes 模式族提供
Raman gain。Stokes 场从弱噪声开始增长，并在与 Primary 共享的光势阱中被时间俘获。

因此，Stokes soliton 不是简单复制 Primary soliton。它的强度、频谱和漂移由 Raman
gain/loss、overlap、FSR mismatch、Stokes dispersion 和 wavelength ratio 共同决定。
在默认 preset 下，主要通过扫描 `Pump detuning` 可以观察 Primary soliton 形成以及
Stokes soliton 从噪声中增长的过程。

## Demo

1. 在 `MODEL` 中选择 `Stokes soliton`。
2. 使用默认参数：`grid = 1024`, `Pump detuning = 39.1`, `Pump power = 12.247`,
   `Primary D2 = 0.02`, `Stokes D2 = 0.02`, `FSR mismatch = 0`,
   `Overlap = 0.5`, `fR = 0.18`, `Primary Raman loss = 0.126`,
   `Stokes Raman gain = 0.126`, `Wavelength ratio = 1550/1630`,
   `tauR = 0.00033`, `Noise seed = 0.00001`, `stepsPerFrame = 1000`。
3. 点击 `Play`。
4. 在 `Temporal field` 中比较 Primary 和 Stokes 的强度分布。
5. 在 `Temporal evolution` 中观察两个场的时间演化；Stokes 场通常从弱噪声背景中增长。
6. 主要扫描 `Pump detuning`，尝试观察 Primary soliton 到 Stokes soliton 的转换。

如果 Stokes 场始终接近噪声，可以适度增加 `Stokes Raman gain` 或延长运行时间。如果仿真
变慢，优先降低 `stepsPerFrame` 或网格点数。

## 参考文献

- Q.-F. Yang, X. Yi, K. Y. Yang, and K. Vahala, "Stokes solitons in optical microcavities," *Nature Physics* **13**, 53-57 (2017). <https://doi.org/10.1038/nphys3875>
- Supplementary information for "Stokes solitons in optical microcavities," *Nature Physics* (2017).
- 本实现的默认 Stokes 参数沿用开发时参考的 MATLAB 脚本 `Ramansoliton_scan.m` 和 `Ramansoliton_splitstep.m` 中的归一化设定。
