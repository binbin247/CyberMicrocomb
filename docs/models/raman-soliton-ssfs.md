# Raman soliton self-frequency shift

[English](./raman-soliton-ssfs.en.md)

## 仿真的方程

该模型用于演示 Raman 卷积导致的孤子自频移 (soliton self-frequency shift, SSFS)。
它与 `Standard soliton` 中的简化 Raman shock 项不同，这里显式使用 Raman 响应函数
和卷积。

物理量方程可理解为在单场 LLE 的 Kerr 项中加入延迟 Raman 响应：
$i g|A|^2A$ 被替换为
$i g A[(1-f_R)|A|^2+f_R h_R*|A|^2]$。其中 $h_R$ 是归一化 Raman 响应函数，
卷积沿环向坐标或等效快时间进行。页面仍采用 $t=\kappa T/2$ 的损耗半宽归一化；
`Detuning` 对应 $\alpha=2\delta_0/\kappa$，`Pump ratio` 为 $F^2$，求解器实际加入的
泵浦幅度是 $F=\sqrt{\texttt{Pump ratio}}$。

归一化 LLE 写成

$$
\frac{\partial \psi}{\partial t}
=-(1+i\alpha)\psi
+i\frac{d_2}{2}\frac{\partial^2\psi}{\partial\phi^2}
+i(1-f_R)|\psi|^2\psi
+i\psi\, f_R\int h_R(\phi-\phi')|\psi(\phi')|^2\,d\phi'
+F .
$$

浏览器求解器用 FFT 计算卷积：

$$
R_\mathrm{conv} =
i\,\mathcal{F}^{-1}\left[
\mathcal{F}\{|\psi|^2\}\mathcal{F}\{h_R\}
\right]\Delta\phi .
$$

默认 Raman 响应函数采用阻尼振荡形式，由 `tau1Fs`、`tau2Fs` 和 `fR`
控制。运行初期会把 Raman 强度从 0 平滑 ramp 到目标值，避免一开始直接打开强 Raman
导致数值跳变。

## 物理图像

Raman 响应不是瞬时 Kerr 响应。孤子强度峰会激发一个有延迟的非线性响应，
这个延迟响应打破频谱对称性，使孤子的谱质心发生偏移，即自频移。

除了四张常规图，该模型还实时显示两个派生量：

- `pulse width fs`：显示在 `Temporal field` 面板中，表示时域强度的 FWHM，使用 `FSR` 换算到飞秒。
- `SSFS THz`：显示在 `Comb spectrum` 面板中，表示由频谱功率质心估计的自频移。

## Demo

1. 在 `MODEL` 中选择 `Raman soliton self-frequency shift`。
2. 保持默认值：`grid = 512`, `ffNorm = 90`, `dtnNorm = 70`,
   `fR = 0.020`, `tau1Fs = 11.1`, `tau2Fs = 35`, `FSR = 1000 GHz`,
   `Q = 4e6`。
3. 点击 `Play`，确认时域中出现 FWHM 低于 35 fs 的稳定 soliton。
4. 观察 `pulse width fs` 和 `SSFS THz` 是否趋于稳定。
5. 扫描 `dtnNorm`，比较脉宽和自频移如何随失谐变化。较高失谐通常会压缩
   soliton 并增强自频移，但也更接近掉态边界，建议缓慢增加并观察能量曲线。
6. 扫描 `fR` 或 `tau1Fs/tau2Fs`，观察 Raman 响应函数对 SSFS 的影响。

该模型用于快速理解 Raman convolution 与 SSFS 之间的关系。v1 不做 SciPy 曲线拟合，
脉宽和 SSFS 是轻量实时估计；更精确的物理单位拟合可以后续加入。

## 参考文献

- M. Karpov, H. Guo, A. Kordts, V. Brasch, M. H. P. Pfeiffer, M. Zervas,
  M. Geiselmann, and T. J. Kippenberg, "Raman Self-Frequency Shift of
  Dissipative Kerr Solitons in an Optical Microresonator,"
  *Physical Review Letters* **116**, 103902 (2016).
  [https://doi.org/10.1103/PhysRevLett.116.103902](https://doi.org/10.1103/PhysRevLett.116.103902)
