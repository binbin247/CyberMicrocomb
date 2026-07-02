# Standard dark pulse (platicon)

[English](./standard-dark-pulse-platicon.en.md)

## 仿真的方程

这是正常色散单场 LLE，用于演示暗脉冲 / platicon。它保留二阶色散和一个局部模式偏移，
不包含 Raman、$d_3$ 或 $d_4$：

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

其中 $\mathcal{F}^{-1}[\cdots]$ 表示把单个模式的局部偏移从频域变回时域。等价地，
频域积分色散写成

$$
D_{\mathrm{int}}(\mu)
=
\frac{d_2\mu^2}{2}
+\Delta_{\mathrm{shift}}\delta_{\mu,\mu_{\mathrm{shift}}}.
$$

这里 $d_2>0$ 表示当前归一化约定下的正常色散。
$\mu_{\mathrm{shift}}$ 是被扰动的整数模式，$\Delta_{\mathrm{shift}}$ 是归一化到
$\kappa/2$ 的模式偏移强度。正的 `Mode shift strength` 表示增大该模式的
$D_{\mathrm{int}}$。当前实现只移动一个模式，不自动同时移动 $\pm\mu$。

## 物理图像

在正常色散中，亮孤子通常不是稳定态。系统更容易形成两个连续波背景之间的 switching fronts；
这些 fronts 围成一个宽的暗缺口或平顶结构，即暗脉冲 / platicon。

局部模式偏移改变某个模式的积分色散，可等效模拟 avoided mode crossing 或泵浦附近的局部模式扰动。
它为正常色散系统提供进入低噪声暗脉冲态的通道。

四张图可以这样读：

- `Temporal field`：看高背景上是否出现宽暗缺口或 flat-top switching-front 结构。
- `Comb spectrum`：看正常色散光梳是否形成，并注意被扰动模式附近的谱线变化。
- `Intracavity energy`：看暗脉冲态是否稳定。
- `Temporal evolution`：看暗缺口是否保持、漂移或破裂。

## Demo

1. 在 `MODEL` 中选择 `Standard dark pulse (platicon)`。
2. 保持默认值：`grid = 512`, `Detuning = 4`, `Pump power = 3.94`,
   `D2 = 0.02`, `Mode shift position = 0`, `Mode shift strength = 4`。
3. 点击 `Play`，观察时域中是否出现高背景上的暗缺口。
4. 扫描 `Mode shift strength`：太弱可能无法触发稳定暗脉冲，太强可能引入不规则谱。
5. 改变 `Mode shift position`，观察不同局部模式扰动对光梳频谱的影响。
6. 扫描 `Detuning`，比较 platicon 宽度、能量和频谱带宽的变化。

本模型突出正常色散与局部模式扰动的作用，不包含热效应、多模族动力学或完整 avoided-crossing 耦合。

## 参考文献

- X. Xue, Y. Xuan, Y. Liu, P.-H. Wang, S. Chen, J. Wang, D. E. Leaird, M. Qi, and A. M. Weiner, "Mode-locked dark pulse Kerr combs in normal-dispersion microresonators," *Nature Photonics* **9**, 594-600 (2015). <https://doi.org/10.1038/nphoton.2015.137>
- H. Wang, B. Shen, Y. Yu, Z. Yuan, C. Bao, W. Jin, L. Chang, M. A. Leal, A. Feshali, M. Paniccia, J. E. Bowers, and K. Vahala, "Self-regulating soliton switching waves in microresonators," *Physical Review A* **106**, 053508 (2022). <https://doi.org/10.1103/PhysRevA.106.053508>
