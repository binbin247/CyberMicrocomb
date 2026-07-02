# Standard dark pulse (platicon)

[English](./standard-dark-pulse-platicon.en.md)

## 仿真的方程

这是正常色散单场 LLE，用于演示暗脉冲 / platicon。它与 `Standard soliton` 使用同一套
单场归一化，但只保留二阶色散和一个局部模式偏移，不包含 Raman、$d_3$ 或 $d_4$。
这里同样采用光子数归一化的腔内慢变场 $A$，总损耗
$\kappa=\kappa_0+\kappa_{\mathrm{ext}}$，输入场
$|s_{\mathrm{in}}|^2=P_{\mathrm{in}}/\hbar\omega_p$，以及失谐
$\delta_0=\omega_0-\omega_p$。

### 真实物理量方程

令 $A(\phi,T)$ 为腔内慢变场。物理量方程为

$$
\frac{\partial A}{\partial T}
=
\left[-\frac{\kappa}{2}-i\delta_0+i g|A|^2\right]A
-\frac{iD_2}{2}\frac{\partial^2A}{\partial\phi^2}
+i\mathcal{F}^{-1}
\left[
\Delta\Omega_{\mathrm{shift}}\delta_{\mu,\mu_{\mathrm{shift}}}\hat{A}_\mu
\right]
+\sqrt{\kappa_{\mathrm{ex}}}\,s_{\mathrm{in}} .
$$

其中 $\Delta\Omega_{\mathrm{shift}}$ 是被扰动模式的物理频率偏移。它表示局部模式相对
未扰动模式网格的频率偏移，可用来近似 avoided mode crossing 或局部模式耦合对
integrated dispersion 的影响。等价地，物理量 integrated dispersion 为

$$
D_{\mathrm{int}}^{\mathrm{phys}}(\mu)
=
\frac{D_2\mu^2}{2}
+\Delta\Omega_{\mathrm{shift}}\delta_{\mu,\mu_{\mathrm{shift}}}.
$$

### 归一化

归一化方式与 `Standard soliton` 相同：

$$
t=\frac{\kappa T}{2},\qquad
\psi=\sqrt{\frac{2g}{\kappa}}\,A,\qquad
\alpha=\frac{2\delta_0}{\kappa},
$$

$$
d_2=\frac{2D_2}{\kappa},\qquad
\Delta_{\mathrm{shift}}=\frac{2\Delta\Omega_{\mathrm{shift}}}{\kappa},\qquad
F=\sqrt{\frac{8g\kappa_{\mathrm{ex}}P_{\mathrm{in}}}{\hbar\omega_p\kappa^3}} .
$$

### 页面求解的归一化方程

页面求解

$$
\frac{\partial \psi}{\partial t}
=
[-(1+i\alpha)+i|\psi|^2]\psi
-\frac{i d_2}{2}\frac{\partial^2\psi}{\partial\phi^2}
+i\mathcal{F}^{-1}
\left[
\Delta_{\mathrm{shift}}\delta_{\mu,\mu_{\mathrm{shift}}}\hat{\psi}_\mu
\right]
+F.
$$

频域中这等价于

$$
D_{\mathrm{int}}(\mu)
=
\frac{d_2\mu^2}{2}
+\Delta_{\mathrm{shift}}\delta_{\mu,\mu_{\mathrm{shift}}}.
$$

$d_2>0$ 表示当前归一化约定下的正常色散。$\mu_{\mathrm{shift}}$ 是被扰动的整数模式，
$\Delta_{\mathrm{shift}}$ 是归一化到 $\kappa/2$ 的模式偏移强度。正的
`Mode shift strength` 表示增大该模式的 $D_{\mathrm{int}}$。当前实现只移动一个模式，
不自动同时移动 $\pm\mu$。

## 物理图像

在正常色散中，亮孤子通常不是稳定态。系统更容易形成两个连续波背景之间的 switching fronts；
这些 fronts 围成一个宽的暗缺口或平顶结构，即暗脉冲 / platicon。

局部模式偏移改变某个模式的积分色散，可等效模拟 avoided mode crossing 或泵浦附近的局部模式扰动。
它为正常色散系统提供进入低噪声暗脉冲态的通道。

四张图可以这样读：

- `Temporal field`：看高背景上是否出现宽暗缺口或 flat-top switching-front 结构。
- `Comb spectrum`：看正常色散光梳是否形成，并注意被扰动模式附近的谱线变化。
- `Intracavity energy`：看 $\langle|\psi|^2\rangle$ 表示的归一化平均腔内光子数/功率是否稳定。
- `Temporal evolution`：看暗缺口是否保持、漂移或破裂。

## Demo

### Demo 1：默认参数直接运行

1. 在 `MODEL` 中选择 `Standard dark pulse (platicon)`。
2. 保持默认值：`grid = 512`, `Detuning = 4`, `Pump power = 3.94`,
   `D2 = 0.02`, `Mode shift position = 0`, `Mode shift strength = 4`。
3. 点击 `Play`，观察时域中是否出现高背景上的暗缺口。
4. 扫描 `Mode shift strength`：太弱可能无法触发稳定暗脉冲，太强可能引入不规则谱。
5. 改变 `Mode shift position`，观察不同局部模式扰动对光梳频谱的影响。
6. 扫描 `Detuning`，比较 platicon 宽度、能量和频谱带宽的变化。

### Demo 2：扫描 detuning，从噪声演化到 dark pulse / platicon

1. 保持除 `Detuning` 外的默认参数不变。
2. 先把 `Detuning` 调到较小值，例如 `0`。
3. 点击 `Reset`，让场重新从噪声/低强度初态开始。
4. 点击 `Play`，然后缓慢把 `Detuning` 从小值扫到默认目标值 `4`。
5. 观察 `Temporal field` 中高背景上的暗缺口如何形成，并用 `Intracavity energy`
   判断是否进入稳定 dark-pulse 状态。

本模型突出正常色散与局部模式扰动的作用，不包含热效应、多模族动力学或完整 avoided-crossing 耦合。

## 参考文献

- X. Xue, Y. Xuan, Y. Liu, P.-H. Wang, S. Chen, J. Wang, D. E. Leaird, M. Qi, and A. M. Weiner, "Mode-locked dark pulse Kerr combs in normal-dispersion microresonators," *Nature Photonics* **9**, 594-600 (2015). <https://doi.org/10.1038/nphoton.2015.137>
- H. Wang, B. Shen, Y. Yu, Z. Yuan, C. Bao, W. Jin, L. Chang, M. A. Leal, A. Feshali, M. Paniccia, J. E. Bowers, and K. Vahala, "Self-regulating soliton switching waves in microresonators," *Physical Review A* **106**, 053508 (2022). <https://doi.org/10.1103/PhysRevA.106.053508>
