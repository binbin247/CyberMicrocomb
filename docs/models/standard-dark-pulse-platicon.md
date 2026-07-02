# Standard dark pulse (platicon)

[English](./standard-dark-pulse-platicon.en.md)

## 仿真的方程

该模型是 normal-dispersion 单场 LLE，并在一个指定模式上加入局部 mode shift。
变量定义与 `Standard soliton` 相同。

$$
\frac{\partial \psi}{\partial t}
=
\left[-(1+i\alpha)+iD_{\mathrm{int}}(\mu)+i|\psi|^2\right]\psi+F.
$$

色散包含二阶项和单点模式扰动：

$$
D_{\mathrm{int}}(\mu)
=
\frac{d_2\mu^2}{2}
+\Delta_{\mathrm{shift}}\delta_{\mu,\mu_{\mathrm{shift}}}.
$$

其中 $d_2>0$ 对应当前归一化约定下的 normal dispersion，
$\mu_{\mathrm{shift}}$ 是被扰动的相对模式编号，
$\Delta_{\mathrm{shift}}$ 是归一化到 $\kappa/2$ 的模式偏移强度。当前实现只移动
一个整数模式，不自动同时移动 $\pm\mu$ 两个模式。

## 物理图像

在 normal dispersion 中，常规 bright soliton 不再是自然稳定的解。系统可以通过
两个 cw 背景之间的 switching fronts 形成 flat-top 的暗脉冲结构，也就是
dark pulse / platicon。局部 mode shift 可以改变某个模式的有效 integrated
dispersion，类似引入 mode interaction，从而帮助系统进入 platicon 态。

在时域图中，platicon 通常表现为高背景上的宽暗缺口或 flat-top switching-front
结构；在频域中，对应 normal-dispersion comb。`Mode shift position` 决定扰动施加
在哪个 comb mode，`Mode shift strength` 决定扰动强度。过弱的扰动可能无法稳定触发
dark pulse，过强的扰动可能导致频谱或时域结构变得不规则。

## Demo

1. 在 `MODEL` 中选择 `Standard dark pulse (platicon)`。
2. 使用默认参数：`grid = 512`, `Detuning = 4`, `Pump power = 3.94`,
   `D2 = 0.02`, `Mode shift position = 0`, `Mode shift strength = 4`。
3. 点击 `Play`。
4. 观察 `Temporal field` 中是否出现高背景上的暗缺口或平顶结构。
5. 保持 `D2 > 0`，扫描 `Mode shift strength`，比较 dark pulse 的深度和稳定性。
6. 改变 `Mode shift position`，观察被扰动模式位置对频谱形状的影响。

该模型不包含 Raman、$d_3$ 或 $d_4$ 项，目的是突出 normal dispersion 与局部
mode perturbation 对 platicon 形成的作用。

## 参考文献

- V. E. Lobanov, G. Lihachev, T. J. Kippenberg, and M. L. Gorodetsky, "Frequency combs and platicons in optical microresonators with normal GVD," *Optics Express* **23**, 7713 (2015). <https://doi.org/10.1364/OE.23.007713>
- "Platicon microcomb generation using pump and additional mode perturbation," *Communications Physics* (2023). <https://www.nature.com/articles/s42005-023-01424-5>
