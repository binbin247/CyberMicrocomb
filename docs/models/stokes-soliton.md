# Stokes soliton

[English](./stokes-soliton.en.md)

## 仿真的方程

该模型对应 Yang *et al.* 的 Stokes soliton 文献中给出的双场 coupled
Lugiato-Lefever equation。Primary 场被外部连续波泵浦驱动，Stokes 场通过 Raman
增益从噪声中增长。为避免和单场模型混淆，本文档把物理量方程、页面归一化方程和
MATLAB 脚本中使用的色散 ratio 分开说明。

### 真实物理量方程

令 $E_p(\phi,T)$ 和 $E_s(\phi,T)$ 分别为 Primary 和 Stokes 腔内慢变场。补充材料
Eq. S7/S8 在 Raman 绝热近似下写为

$$
\begin{aligned}
\frac{\partial E_p}{\partial T}
&=
i\frac{D_{2p}}{2}\frac{\partial^2 E_p}{\partial\phi^2}
+i\left[g_p|E_p|^2+(2-f_R)G_p|E_s|^2\right]E_p \\
&\quad
-iD_{1p}\tau_R E_p
\frac{\partial\left(g_p|E_p|^2+G_p|E_s|^2\right)}{\partial\phi}
-\left(\frac{\kappa_p}{2}+i\Delta\omega_p\right)E_p \\
&\quad
-\frac{\omega_p}{\omega_s}R|E_s|^2E_p
+\sqrt{\kappa_p^{\mathrm{ext}}P_{\mathrm{in}}},
\end{aligned}
$$

$$
\begin{aligned}
\frac{\partial E_s}{\partial T}
&=
-\delta\frac{\partial E_s}{\partial\phi}
+i\frac{D_{2s}}{2}\frac{\partial^2 E_s}{\partial\phi^2}
+i\left[g_s|E_s|^2+(2-f_R)G_s|E_p|^2\right]E_s \\
&\quad
-iD_{1p}\tau_R E_s
\frac{\partial\left(g_s|E_s|^2+G_s|E_p|^2\right)}{\partial\phi}
-\left(\frac{\kappa_s}{2}+i\Delta\omega_s\right)E_s
+R|E_p|^2E_s .
\end{aligned}
$$

文献中 $E_p,E_s$ 不是电场强度本身，而是按 optical energy 归一化后的腔内慢变场。
$D_{1j}$ 和 $D_{2j}$ 分别是模式族
$j=p,s$ 的 FSR 和二阶色散；$\delta=D_{1s}-D_{1p}$ 是 Primary/Stokes FSR
mismatch；$\kappa_j$ 和 $\Delta\omega_j$ 是损耗率与冷腔失谐；$g_j$ 和 $G_j$
是 self- 与 cross-phase modulation 系数；$R$ 是 Raman gain 系数；$\tau_R$
是 Raman shock time。

### 归一化

页面的交互模型把时间按 Primary 损耗半宽归一化，并把两路场幅重写为无量纲变量：

$$
t=\frac{\kappa_p T}{2},\qquad
P=\sqrt{\frac{2g_p}{\kappa_p}}\,E_p,\qquad
S=\sqrt{\frac{2g_s}{\kappa_s}}\,E_s .
$$

主要无量纲参数为

$$
\alpha_p=\frac{2\Delta\omega_p}{\kappa_p},\qquad
\alpha_s=\frac{2\Delta\omega_s}{\kappa_s}.
$$

$$
\Delta_{\mathrm{FSR}}\propto\frac{2(D_{1s}-D_{1p})}{\kappa_p},\qquad
F=\sqrt{\frac{8g_p\kappa_p^{\mathrm{ext}}P_{\mathrm{in}}}
{\hbar\omega_p\kappa_p^3}} .
$$

`Primary D2` 和 `Stokes D2` 沿用参考 MATLAB 脚本中的 ratio 定义，近似为
$D_{2p}/\kappa_p$ 和 $D_{2s}/\kappa_s$，因此页面方程中写作
$i d_{2j}\partial_\phi^2$，在频域中对应 $-i d_{2j}\mu^2$。这与
`Standard soliton` 中 $d_2=2D_2/\kappa$、色散项写成
$-i d_2\partial_\phi^2/2$ 的口径不同。

`Overlap` 记作 $\eta$，`Wavelength ratio` 记作 $\rho$，`Primary Raman loss` 和
`Stokes Raman gain` 分别记作 $g_{Rp}$ 和 $g_{Rs}$。当前页面把 Stokes 失谐
$\alpha_s$ 固定为 0，并把 Stokes 损耗也写成同样的归一化损耗 `-1`，这是为了保持交互模型简洁。
`FSR mismatch` 的符号按页面方程定义：它是 $-\Delta_{\mathrm{FSR}}\partial_\phi S$
前的系数。$\rho$ 对应 Stokes 与 Primary 的频率比，近似等于 $\lambda_p/\lambda_s$。

### 页面求解的归一化方程

当前 `public/lle_solver.py` 实际求解的双场方程为

$$
\begin{aligned}
\frac{\partial P}{\partial t}
&=
\left[-(1+i\alpha_p)+i d_{2p}\partial_\phi^2\right]P \\
&\quad+
\left[
i|P|^2
-i\tau_R\partial_\phi\left(|P|^2+\eta |S|^2\right)
+\eta\left(i(2-f_R)-\frac{g_{Rp}}{2}\right)|S|^2
\right]P
+F ,
\end{aligned}
$$

$$
\begin{aligned}
\frac{\partial S}{\partial t}
&=
\left[-(1+i\alpha_s)-\Delta_{\mathrm{FSR}}\partial_\phi
+i d_{2s}\partial_\phi^2\right]S \\
&\quad+
\left[
i\rho |S|^2
-i\rho\tau_R\partial_\phi\left(\eta |P|^2+|S|^2\right)
+\eta\rho\left(i(2-f_R)+\frac{g_{Rs}}{2}\right)|P|^2
\right]S
+\xi_s .
\end{aligned}
$$

$\xi_s$ 是由 `Noise seed` 控制的弱随机 Stokes 种子。界面中的 `Pump detuning`,
`FSR mismatch`, `Primary/Stokes D2`, `Overlap`, `Primary Raman loss`,
`Stokes Raman gain`, `Wavelength ratio` 和 `tauR` 分别对应上式中的
$\alpha_p$、$\Delta_{\mathrm{FSR}}$、$d_{2p/s}$、$\eta$、$g_{Rp}$、$g_{Rs}$、
$\rho$ 和 $\tau_R$。

## 物理图像

Stokes soliton 不是 Primary soliton 的简单复制，而是 Raman 过程产生的第二个孤子场。
Primary soliton 先形成强局域光场；该光场为 Stokes 模式族提供 Raman 增益，并通过交叉相位调制和群速匹配把 Stokes 脉冲俘获在相近的时间位置。

四张图可以这样读：

- `Temporal field`：比较 Primary 和 Stokes 的时域强度，Stokes 通常更弱并由噪声增长。
- `Comb spectrum`：比较两个模式族的谱宽、谱峰和相对强度。
- `Intracavity energy`：看 Primary 的归一化平均腔内功率是否先建立，Stokes 是否随后增长并稳定。
- `Temporal evolution`：左右两图分别显示 Primary 与 Stokes 的演化，用来判断俘获、漂移或失稳。

Stokes 场的强度和稳定性由 Raman 增益/损耗、模式重叠、FSR mismatch、Stokes 色散和
波长比共同决定。默认参数的设计目标是：主要扫描 `Pump detuning`，即可观察
Primary soliton 建立以及 Stokes soliton 从噪声中增长的过程。

## Demo

### Demo 1：默认参数直接运行

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

### Demo 2：扫描 detuning，从噪声演化到 Stokes soliton

1. 保持除 `Pump detuning` 外的默认参数不变。
2. 先把 `Pump detuning` 调到较小值，例如 `0`。
3. 点击 `Reset`，让 Primary 和 Stokes 场从噪声/低强度初态重新开始。
4. 点击 `Play`，然后缓慢把 `Pump detuning` 从小值扫到默认目标值 `39.1`。
5. 观察 Primary soliton 先形成，再看 Stokes 场是否从噪声中增长并被时间俘获；
   `Temporal evolution` 的两张子图应分别显示 Primary 和 Stokes 的演化过程。

如果仿真变慢，优先降低 `stepsPerFrame` 或网格点数。该模型用于交互式理解 Stokes soliton
机制，不包含热动力学或完整多模族耦合。

## 参考文献

- Q.-F. Yang, X. Yi, K. Y. Yang, and K. Vahala, "Stokes solitons in optical microcavities," *Nature Physics* **13**, 53-57 (2017). <https://doi.org/10.1038/nphys3875>
- Supplementary information for "Stokes solitons in optical microcavities," *Nature Physics* (2017).
- 本页面默认参数采用与上述补充材料一致的归一化 Stokes-soliton 机制设置。
