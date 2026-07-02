# Standard soliton

[English](./standard-soliton.en.md)

## 仿真的方程

下面先写真实物理量方程，再写页面实际求解的归一化方程。$T$ 是真实慢时间，
$\phi\in[-\pi,\pi)$ 是环向坐标，$\mu$ 是相对模式编号。

本文档采用飞书知识库中的输入输出方程口径：腔内慢变场先写成光子数归一化变量
$A$，满足 $|A|^2$ 为腔内光子数；总损耗为
$\kappa=\kappa_0+\kappa_{\mathrm{ext}}$；输入场满足
$|s_{\mathrm{in}}|^2=P_{\mathrm{in}}/\hbar\omega_p$。失谐定义为
$\delta_0=\omega_0-\omega_p$，即冷腔共振频率相对泵浦频率的失谐；页面中的
`Detuning` 为 $\alpha=2\delta_0/\kappa$。

### 真实物理量方程

令 $A(\phi,T)$ 为腔内慢变场，$|A|^2$ 表示腔内光子数。单场微腔 LLE 可写为

$$
\frac{\partial A}{\partial T}
=
\left[-\frac{\kappa}{2}-i\delta_0+i g|A|^2\right]A
+iD_{\mathrm{int}}^{\mathrm{phys}}(-i\partial_\phi)A
+\sqrt{\kappa_{\mathrm{ex}}}\,s_{\mathrm{in}} .
$$

其中 $\kappa$ 是总损耗率，$\kappa_{\mathrm{ex}}$ 是外耦合损耗率，$g$ 是单光子
Kerr 频移。
最经典的二阶 LLE 只保留 $D_2$：

$$
\frac{\partial A}{\partial T}
=
\left[-\frac{\kappa}{2}-i\delta_0+i g|A|^2\right]A
-\frac{iD_2}{2}\frac{\partial^2A}{\partial\phi^2}
+\sqrt{\kappa_{\mathrm{ex}}}\,s_{\mathrm{in}} .
$$

如果考虑高阶色散和 Raman shock，物理量方程中再加入

$$
\mathcal{P}_{\mathrm{HOD}}^{\mathrm{phys}}
=
-\frac{D_3}{6}\frac{\partial^3A}{\partial\phi^3}
+\frac{iD_4}{24}\frac{\partial^4A}{\partial\phi^4},
$$

$$
\mathcal{P}_{\mathrm{Raman}}^{\mathrm{phys}}
=
i g D_1 T_R\,A\frac{\partial |A|^2}{\partial\phi}.
$$

这里 $D_1$ 是角频率 FSR，$T_R$ 是 Raman shock 时间。物理量 integrated dispersion 为

$$
D_{\mathrm{int}}^{\mathrm{phys}}(\mu)
=
\frac{D_2\mu^2}{2}
+\frac{D_3\mu^3}{6}
+\frac{D_4\mu^4}{24}.
$$

### 归一化

页面使用损耗半宽 $\kappa/2$ 归一化时间，用 Kerr 非线性归一化场：

$$
t=\frac{\kappa T}{2},\qquad
\psi=\sqrt{\frac{2g}{\kappa}}\,A .
$$

对应的无量纲参数是

$$
\alpha=\frac{2\delta_0}{\kappa},\qquad
d_m=\frac{2D_m}{\kappa}\quad(m=2,3,4),
$$

$$
F=\sqrt{\frac{8g\kappa_{\mathrm{ex}}P_{\mathrm{in}}}
{\hbar\omega_p\kappa^3}},\qquad
\tau_R=D_1T_R .
$$

在这个约定下，$\tau_R$ 的符号也依赖 $\phi$ 的正方向；本页面采用
$+i\tau_R\psi\partial_\phi|\psi|^2$。

### 页面求解的归一化方程

纯二阶、无 Raman 的经典 LLE 为

$$
\frac{\partial \psi}{\partial t}
=
[-(1+i\alpha)+i|\psi|^2]\psi
-\frac{i d_2}{2}\frac{\partial^2\psi}{\partial\phi^2}
+F.
$$

高阶色散和 Raman 作为微扰加入：

$$
\frac{\partial \psi}{\partial t}
=
\left.\frac{\partial \psi}{\partial t}\right|_{\mathrm{classic}}
-\frac{d_3}{6}\frac{\partial^3\psi}{\partial\phi^3}
+\frac{i d_4}{24}\frac{\partial^4\psi}{\partial\phi^4}
+i\tau_R\psi\frac{\partial |\psi|^2}{\partial \phi}.
$$

因此令 $d_3=d_4=\tau_R=0$ 时，模型回到纯二阶、无 Raman 的经典 LLE。
色散项也可以写成 $iD_{\mathrm{int}}(-i\partial_\phi)\psi$。在当前 Fourier
约定下，$\partial_\phi\to i\mu$，频域 integrated dispersion 为

$$
D_{\mathrm{int}}(\mu)
=
\frac{d_2\mu^2}{2}
+\frac{d_3\mu^3}{6}
+\frac{d_4\mu^4}{24}.
$$

当前求解器采用一阶分步傅里叶方法：时域更新 Kerr/Raman 项，频域更新损耗、失谐和色散项，
最后显式加入泵浦。

## 物理图像

Standard soliton 的核心平衡是：连续波泵浦补偿腔损耗，Kerr 非线性提供强度相关相移，
反常色散 $d_2<0$ 平衡该非线性相移，从而形成局域亮脉冲。

四张图可以这样读：

- `Temporal field`：看 $|\psi|^2$ 是否形成窄的亮峰。
- `Comb spectrum`：看泵浦附近是否出现宽而连续的光梳包络。
- `Intracavity energy`：看 $\langle|\psi|^2\rangle$ 表示的归一化平均腔内光子数/功率是否趋于稳定。
- `Temporal evolution`：看孤子是否漂移、分裂或进入不稳定状态。

增加失谐通常会改变孤子宽度和峰值强度。$d_3$ 或 $d_4$ 会引入高阶色散，可产生不对称频谱或
dispersive-wave 特征。非零 $\tau_R$ 通过
$i\tau_R\psi\partial_\phi|\psi|^2$ 改变非线性相位，可用于探索 Raman
self-frequency-shift 类效应。

## Demo

### Demo 1：默认参数直接运行

1. 在 `MODEL` 中选择 `Standard soliton`。
2. 保持默认值：`grid = 512`, `Detuning = 10`, `Pump power = 3.94`,
   `D2 = -0.0444`, `D3 = 0`, `D4 = 0`, `tauR = 0`。
3. 点击 `Play`，先确认时域中出现一个稳定亮脉冲。
4. 缓慢扫描 `Detuning`，观察脉冲变窄、峰值变化以及能量曲线的响应。
5. 将 `D3` 或 `D4` 调成非零，观察频谱不对称和可能的窄峰结构。
6. 将 `tauR` 从 0 小幅增加，观察脉冲和频谱的偏移趋势。

### Demo 2：扫描 detuning，从噪声演化到亮孤子

1. 保持除 `Detuning` 外的默认参数不变。
2. 先把 `Detuning` 调到较小值，例如 `-5`。
3. 点击 `Reset`，让场回到噪声/低强度初态。
4. 点击 `Play`，然后缓慢把 `Detuning` 从小值扫到默认目标值 `10`。
5. 观察 `Temporal field` 中亮孤子从噪声背景中形成，并确认 `Intracavity energy`
   最终进入稳定平台。

### Demo 3：Breather soliton

1. 先用默认参数得到一个稳定的 bright soliton。
2. 保持 `D3 = 0`, `D4 = 0`, `tauR = 0`，只调节驱动参数。
3. 将 `Detuning` 从默认值 `10` 缓慢降低到 `6` 到 `8` 附近；如果呼吸不明显，
   可把 `Pump power` 小幅提高到 `4.5` 到 `5.5` 再继续扫描 `Detuning`。
4. 在 `Intracavity energy` 中寻找周期性振荡，而不是单调收敛的平台。
5. 在 `Temporal evolution` 中确认孤子条纹出现周期性变宽、变窄或亮度振荡。
6. 如果脉冲直接消失或进入强混沌，回到上一个稳定点，减小扫描步长，并适当降低
   `Pump power`。

Breather soliton 是稳定孤子附近的振荡态。它不是新的方程，而是同一 LLE 在不同失谐和泵浦条件下的动力学状态。

### Demo 4：Soliton Cherenkov radiation / dispersive wave

1. 先用默认参数得到一个稳定的 bright soliton。
2. 保持 `tauR = 0`，然后加入高阶色散微扰。一个可尝试的起点是
   `D3 = 0.003` 到 `0.006`，或使用较小的非零 `D4`。
3. 点击 `Play` 后观察 `Comb spectrum`。Soliton Cherenkov radiation 的典型信号是：
   在宽的 soliton 光梳包络一侧，出现一个较窄的增强谱峰或谱肩。
4. 改变 `D3` 的符号，观察增强谱峰是否移动到频谱另一侧。
5. 若频谱出现明显数值噪声，先减小 `dt`，或降低 `D3`/`D4` 的绝对值。

这个 demo 展示的是高阶色散导致的相位匹配辐射。时域中常表现为孤子尾部的振荡结构，
频域中则表现为远离泵浦模式的 dispersive-wave 峰。

如果结果发散或频谱出现明显数值噪声，先减小 `dt` 或降低 `Pump power`。求解器会用
$\max |D_{\mathrm{int}}|\,dt < \pi$ 的 aliasing 条件自动限制过大的积分步长；最终定量研究仍应使用更高阶、更精确的积分器。

## 参考文献

- T. Herr, V. Brasch, J. D. Jost, C. Y. Wang, N. M. Kondratiev, M. L. Gorodetsky, and T. J. Kippenberg, "Temporal solitons in optical microresonators," *Nature Photonics* **8**, 145-152 (2014). <https://doi.org/10.1038/nphoton.2013.343>
